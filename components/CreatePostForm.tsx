"use client";

import { TCategory } from "@/app/types";
import Link from "next/link";
import { useEffect, useState, ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { CldUploadButton, CldUploadWidgetResults } from "next-cloudinary";
import Image from "next/image";
import toast from "react-hot-toast";
import "react-quill/dist/quill.bubble.css";
import ReactQuill from "react-quill";
import { UploadButton, isBase64Image, useUploadThing } from '@/utils/utils';


export default function CreatePostForm() {
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<TCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [loading, setLoading] = useState(false);


  const [files, setFiles] = useState<File[]>([]);
  // const [filesT, setFilesT] = useState<File[]>([]);

  const [hasImageChanged, setHasImageChanged] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing("imageUploader");

  // const { startUpload } = useUploadThing("media");

  const router = useRouter();

  useEffect(() => {
    const fetchAllCategories = async () => {
      const res = await fetch("api/categories");
      const catNames = await res.json();
      setCategories(catNames);
    };

    fetchAllCategories();
  }, []);

  // const handleImageUpload = (result: CldUploadWidgetResults) => {
  //   console.log("result: ", result);
  //   const info = result.info as object;

  //   if ("secure_url" in info && "public_id" in info) {
  //     const url = info.secure_url as string;
  //     const public_id = info.public_id as string;
  //     setImageUrl(url);
  //     setPublicId(public_id);
  //     console.log("url: ", url);
  //     console.log("public_id: ", public_id);
  //   }
  // };

  const addLink = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (linkInput.trim() !== "") {
      setLinks((prev) => [...prev, linkInput]);
      setLinkInput("");
    }
  };

  const deleteLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("api/removeImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      if (res.ok) {
        setImageUrl("");
        setPublicId("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log(e.target.files);

  //   handleImage(e, e.target.onchange);
  //   if (inputRef.current && inputRef.current.onchange) {
  //     handleImage(e, inputRef.current.onchange);
  //   }
  // };

  const handleImage = (
    // e: ChangeEvent<HTMLInputElement>,
    e: React.ChangeEvent<HTMLInputElement>,
    // fieldChange: any
  ) => {
    e.preventDefault();

    // console.log(Array.from(e.target.files));
    if (e.target.files && e.target.files[0]) {
      console.log(e.target.files);

    }


    const fileReader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(Array.from(e.target.files));

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        setHasImageChanged(imageDataUrl);
        // console.log(isBase64Image(imageDataUrl));
      };



      fileReader.readAsDataURL(file);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)

    if (hasImageChanged) {
      const imgRes = await startUpload(files);

      if (imgRes && imgRes[0].url) {
        setImageUrl(imgRes[0].url)
        savePost(imgRes[0].url)
      } else {
        toast.error("Erreur d'enrégistrement d'image");
      }
    } else {
      savePost('')
    }
  };

  const savePost = async (url: string) => {
    if (!title || !content) {
      const errorMessage = "Titre et contenu requis";
      toast.error(errorMessage);
      setLoading(false)
      return;
    }

    try {
      const res = await fetch("api/posts/", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          links,
          selectedCategory,
          imageUrl: url,
          publicId,
        }),
      });

      if (res.ok) {
        toast.success("Post créé avec successfully");
        setLoading(false)
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error("Une erreur s'est produite.");
        setLoading(false)
      }
    } catch (error) {
      toast.error("Une erreur s'est produite");
      console.log(error);
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Créer Post</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          placeholder="Titre"
          className="border-none"
        />
        {/* <textarea
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
        ></textarea> */}
        <ReactQuill
          className='w-full min-h-[100px]'
          theme="bubble"
          value={content}
          onChange={setContent}
          placeholder="Saisissez le contenu de votre blog..."
        />

        {links &&
          links.map((link, i) => (
            <div key={i} className="flex items-center gap-4">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                  />
                </svg>
              </span>
              <Link className="link" href={link}>
                {link}
              </Link>
              <span className="cursor-pointer" onClick={() => deleteLink(i)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </span>
            </div>
          ))}

        <div className="flex gap-2">
          <input
            className="flex-1"
            type="text"
            onChange={(e) => setLinkInput(e.target.value)}
            value={linkInput}
            placeholder="Collez le lien et cliquer sur +"
          />
          <button onClick={addLink} className="btn flex gap-2 items-center">
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            </span>
            
          </button>
        </div>

        {/* <CldUploadButton
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          className={`h-48 border-2 mt-4 border-dotted grid place-items-center bg-slate-100 rounded-md relative ${
            imageUrl && "pointer-events-none"
          }`}
          onUpload={handleImageUpload}
        >
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>

          {imageUrl && (
            <Image
              src={imageUrl}
              fill
              className="absolute object-cover inset-0"
              alt={title}
            />
          )}
        </CldUploadButton> */}
        {hasImageChanged ? (
          <label htmlFor="image">
            <div className="w-full h-72 relative">
              <Image
                src={hasImageChanged}
                fill
                className="object-cover rounded-md object-center"
                alt={title}
              />
            </div>

          </label>

        ) : (
          <div className="w-full h-28 flex text-center justify-center items-center border border-gray-200 rounded-lg ">
            <label htmlFor="image">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"

              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </label>
          </div>
        )}

        {/* <UploadButton
          className="hidden"
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            // Do something with the response
            console.log("Files uploaded: ", res);
            // alert("Upload Completed");
          }}
          onUploadError={(error: Error) => {
            // Do something with the error.
            // alert(`ERROR! ${error.message}`);
          }}
        /> */}
        <input
          type='file'
          accept='image/*'
          id="image"
          placeholder='Add profile photo'
          className='hidden'
          ref={inputRef}
          onChange={(e) => handleImage(e)}
        />

        {publicId && (
          <button
            onClick={removeImage}
            className="py-2 px-4 rounded-md font-bold w-fit bg-red-600 text-white mb-4"
          >
            Remove Image
          </button>
        )}

        <select
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-3 rounded-md border appearance-none"
        >
          <option value="">Selectionner une Categorie</option>
          {categories &&
            categories.map((category) => (
              <option key={category.id} value={category.catName}>
                {category.catName}
              </option>
            ))}
        </select>

        <button className="primary-btn disabled:opacity-40" type="submit" disabled={loading}>
          Confirmer
        </button>
      </form>
    </div>
  );
}
