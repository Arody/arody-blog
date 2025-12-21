import PostEditor from "@/components/admin/PostEditor";

export default function NewPostPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-serif mb-8 text-center">New Story</h1>
      <PostEditor />
    </div>
  );
}
