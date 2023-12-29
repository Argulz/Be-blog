import CreatePostForm from "@/components/CreatePostForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Post from "@/components/Post";
import { TPost } from "@/app/types";


const getPost = async (id: string): Promise<TPost| null> => {
    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/posts/${id}`, {
            cache: "no-store",
        });

        if (res.ok) {
            const post = await res.json();
            return post;
        }
    } catch (error) {
        console.log(error);
    }

    return null;
};

export default async function PostItem({
    params
}: {
    params: { postId: string }
}) {
    const post = await getPost(params.postId);
    //   const session = await getServerSession(authOptions);

    //   if (!session) {
    //     redirect("/sign-in");
    //   }
if (post) {
    return <Post
        key={post.id}
        id={post.id}
        author={post.author.name}
        authorEmail={post.authorEmail}
        date={post.createdAt}
        thumbnail={post.imageUrl}
        category={post.catName}
        title={post.title}
        content={post.content}
        links={post.links || []}
        pageId={params.postId}
    />;
}
    
}
