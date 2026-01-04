"use client";

import { useEffect, useState } from "react";
import { Trash2, User, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Comment {
    id: string;
    author_name: string;
    content: string;
    created_at: string;
}

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState({ name: "", content: "" });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchComments();
        checkUser();
        
        // Realtime subscription
        const channel = supabase
            .channel('public:comments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, () => {
                fetchComments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [postId]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAdmin(!!user);
    };

    const fetchComments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setComments(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.name.trim() || !newComment.content.trim()) return;

        // SPAM PROTECTION: Check localStorage
        const lastCommentTime = localStorage.getItem('last_comment_at');
        if (lastCommentTime) {
            const timeSinceLastComment = Date.now() - parseInt(lastCommentTime);
            const cooldownTime = 3 * 60 * 1000; // 3 minutes in milliseconds
            if (timeSinceLastComment < cooldownTime) {
                const remainingSeconds = Math.ceil((cooldownTime - timeSinceLastComment) / 1000);
                alert(`Por favor espera ${remainingSeconds} segundos antes de enviar otro comentario.`);
                return;
            }
        }

        setSubmitting(true);
        const { error } = await supabase
            .from('comments')
            .insert({
                post_id: postId,
                author_name: newComment.name,
                content: newComment.content
            });

        if (error) {
            alert("Error al enviar comentario: " + error.message);
        } else {
            setNewComment({ name: "", content: "" });
            localStorage.setItem('last_comment_at', Date.now().toString()); // Set cooldown timestamp
            fetchComments(); // Refresh immediately
        }
        setSubmitting(false);
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("¿Borrar este comentario?")) return;

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) {
            alert("No se pudo borrar: " + error.message);
        } else {
            fetchComments(); // Refresh immediately
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-16 pt-16 border-t border-gray-100">
            <h3 className="text-2xl font-serif font-bold mb-8">Comentarios ({comments.length})</h3>

            {/* Comments List (Moved to top) */}
            <div className="space-y-6 mb-12">
                {loading ? (
                    <p className="text-center text-gray-400">Cargando comentarios...</p>
                ) : comments.length === 0 ? (
                    <p className="text-center text-gray-400 italic">Sé el primero en comentar.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="group flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                                <User size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-sm block text-gray-900">{comment.author_name}</h4>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-gray-400">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                                title="Borrar comentario"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Nombre</label>
                    <input
                        type="text"
                        value={newComment.name}
                        onChange={(e) => setNewComment(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white text-black border border-gray-200 p-2 rounded focus:outline-none focus:border-black transition"
                        placeholder="Tu nombre (Público)"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Comentario</label>
                    <textarea
                        value={newComment.content}
                        onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full bg-white text-black border border-gray-200 p-2 rounded focus:outline-none focus:border-black transition resize-none h-24"
                        placeholder="Comparte tu opinión..."
                        required
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? "Enviando..." : (
                            <>
                                Enviar <Send size={14} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
