import Link from "next/link";
import { TCategory } from "@/app/types";

const getCategories = async (): Promise<TCategory[] | null> => {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/categories`);

    if (res.ok) {
      const categories = await res.json();
      return categories;
    }
  } catch (error) {
    console.log(error);
  }
  return null;
};

export default async function CategoriesList({catNameProp}:{catNameProp: string}) {
  const categories = await getCategories();
  return (
    <div className="flex gap-2 text-sm flex-wrap">
      {categories &&
        categories.map((category) => (
          <Link
            key={category.id}
            className="px-4 py-1 rounded-md bg-slate-800 text-white cursor-pointer" 
            // className={`px-4 py-1 rounded-md text-white cursor-pointer${catNameProp==category.catName? 'bg-slate-400':'bg-slate-800'}`}
            href={`/categories/${category.catName}`}
          >
            {category.catName}
          </Link>
        ))}
    </div>
  );
}