import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye, Sparkles, Loader2 } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useToast } from '@/hooks/use-toast';
import { useBlogValidation } from '@/hooks/useBlogValidation';
import BlogEditorContent from '@/components/admin/blog/BlogEditorContent';
import SimpleBlogEditorSidebar from '@/components/admin/blog/SimpleBlogEditorSidebar';
import SimpleBlogSEOPanel from '@/components/admin/blog/SimpleBlogSEOPanel';
import ReactMarkdown from 'react-markdown';

const BlogEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, createPost, updatePost: updatePostHook, isLoading } = useBlogPosts();
  const { toast } = useToast();
  const { errors, validatePost, clearErrors } = useBlogValidation();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality - SIMPLIFICADO
  useEffect(() => {
    if (!hasUnsavedChanges || !post) return;
    
    const autoSave = setTimeout(() => {
      if (post.title && post.content) { // Solo auto-guardar si hay contenido básico
        handleSave(true);
      }
    }, 300000); // Auto-save cada 5 minutos en lugar de 30 segundos

    return () => clearTimeout(autoSave);
  }, [post?.title, post?.content]); // Solo vigilar cambios críticos

  useEffect(() => {
    if (id && id !== 'new') {
      const existingPost = posts.find(p => p.id === id);
      if (existingPost) {
        setPost(existingPost);
      } else {
        toast({
          title: "Post no encontrado",
          description: "El post que buscas no existe",
          variant: "destructive",
        });
        navigate('/admin/blog-v2');
      }
    } else {
      // New post
      setPost({
        id: '',
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author_name: 'Equipo Capittal',
        category: '',
        tags: [],
        reading_time: 5,
        is_published: false,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        meta_title: '',
        meta_description: '',
      });
    }
  }, [id, posts]);

  const handleSave = async (isAutoSave = false) => {
    if (!post) return;
    
    // Validar solo en guardado manual, no en auto-save
    if (!isAutoSave && !validatePost(post)) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    try {
      const postData = {
        ...post,
        published_at: post.is_published ? new Date().toISOString() : null,
      };

      if (id && id !== 'new') {
        await updatePostHook(id, postData);
      } else {
        const newPost = await createPost(postData);
        if (newPost) {
          navigate(`/admin/blog/edit/${newPost.id}`, { replace: true });
        }
      }

      setHasUnsavedChanges(false);
      clearErrors();
      
      if (!isAutoSave) {
        toast({
          title: "Guardado",
          description: id && id !== 'new' ? "Post actualizado" : "Post creado",
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el post",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePostData = (updates: Partial<BlogPost>) => {
    if (!post) return;
    setPost({ ...post, ...updates });
    setHasUnsavedChanges(true);
  };

  if (isLoading || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/blog-v2')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold">
                {id === 'new' ? 'Nuevo Post' : 'Editar Post'}
              </h1>
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs">
                  Cambios sin guardar
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* IA DESACTIVADA TEMPORALMENTE
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAI(!showAI)}
              className="flex items-center gap-2"
              disabled
            >
              <Sparkles className="h-4 w-4" />
              IA (Próximamente)
            </Button>
            */}
            
            {post.is_published && post.slug && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Vista previa
              </Button>
            )}

            <Button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Content Area */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
          <Tabs defaultValue="editor" className="space-y-6">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Vista previa</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-6">
              {/* Title */}
              <div>
                <Input
                  value={post.title}
                  onChange={(e) => updatePostData({ 
                    title: e.target.value,
                    slug: e.target.value.toLowerCase()
                      .replace(/[áàäâ]/g, 'a')
                      .replace(/[éèëê]/g, 'e')
                      .replace(/[íìïî]/g, 'i')
                      .replace(/[óòöô]/g, 'o')
                      .replace(/[úùüû]/g, 'u')
                      .replace(/ñ/g, 'n')
                      .replace(/[^a-z0-9\s-]/g, '')
                      .replace(/\s+/g, '-')
                      .replace(/-+/g, '-'),
                    meta_title: post.meta_title || e.target.value
                  })}
                  placeholder="Título del post..."
                  className={`text-3xl font-bold border-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground ${
                    errors.title ? 'border-destructive' : ''
                  }`}
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title}</p>
                )}
              </div>

              <BlogEditorContent post={post} updatePost={updatePostData} errors={errors} />
            </TabsContent>

            <TabsContent value="preview">
              <article className="prose prose-lg max-w-none dark:prose-invert">
                {/* Featured Image */}
                {post.featured_image_url && (
                  <div className="mb-8">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* Title and Meta */}
                <header className="mb-8">
                  <h1 className="mb-4">{post.title}</h1>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>Por {post.author_name}</span>
                    <span>•</span>
                    <span>{post.reading_time} min de lectura</span>
                    <span>•</span>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {post.category}
                    </span>
                  </div>
                  
                  {post.excerpt && (
                    <p className="text-lg text-muted-foreground italic border-l-4 border-primary pl-4">
                      {post.excerpt}
                    </p>
                  )}
                </header>

                {/* Content */}
                <div className="prose-content">
                  <ReactMarkdown
                    components={{
                      img: ({alt, src, title}) => (
                        <img
                          src={src}
                          alt={alt}
                          title={title}
                          className="rounded-lg shadow-md"
                        />
                      ),
                      blockquote: ({children}) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              </article>
            </TabsContent>

            <TabsContent value="seo">
              <SimpleBlogSEOPanel post={post} updatePost={updatePostData} />
            </TabsContent>
          </Tabs>
        </main>

        {/* Sidebar */}
        <aside className="w-80 border-l border-border bg-background">
          <SimpleBlogEditorSidebar post={post} updatePost={updatePostData} errors={errors} />
        </aside>
      </div>

      {/* AI Assistant - DESACTIVADO TEMPORALMENTE */}
    </div>
  );
};

export default BlogEditorPage;