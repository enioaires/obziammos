/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/posts";

import AdventureMultiSelect from "../shared/AdventureMultiSelect";
import AudioUploader from "../shared/AudioUploader";
import { Button } from "../ui/button";
import FileUploader from "../shared/FileUploader";
import { Input } from "../ui/input";
import Loader from "../shared/Loader";
import { Models } from "appwrite";
import { MultiSelect } from "../shared/multi-select";
import { PostSchema } from "@/lib/validation";
import { getAvailableTags } from "@/lib/tags";
import { isAdmin } from "@/lib/adventures";
import { useForm } from "react-hook-form";
import { TinyMCEEditor } from "../shared/TinyMCEEditor";
import { useGetAdventuresForUser } from "@/lib/react-query/adventures";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { extractImageIdsFromCaption } from "@/lib/utils";

interface PostFormProps {
  post?: Models.Document;
  action: "create" | "update";
}

const PostForm = ({ post, action }: PostFormProps) => {
  const { mutateAsync: createPost, isPending: isCreating } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isUpdating } = useUpdatePost();

  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  // BUSCAR AVENTURAS DISPONÍVEIS PARA O USUÁRIO
  const { data: userAdventures, isLoading: isLoadingAdventures } = useGetAdventuresForUser(
    user.id,
    user.role
  );

  // Obtém as tags disponíveis dinamicamente
  const availableTags = getAvailableTags();

  // Função para preparar as legendas para salvamento
  const prepareCaptions = (htmlContent: string): string[] => {
    if (!htmlContent || htmlContent.trim() === '') return [''];

    // Retorna como array com um elemento (formato esperado pelo banco)
    return [htmlContent];
  };

  const form = useForm<z.infer<typeof PostSchema>>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      title: post ? post.title : "",
      captions: post ? (Array.isArray(post.captions) ? post.captions.join('<br>') : post.captions || "") : "",
      file: [],
      audioFile: [],
      adventures: post ? (post.adventures || []) : [],
      tags: post ? post.tags || [] : [],
    },
  });

  // Observar mudanças no campo adventures para mostrar/esconder aviso
  const watchedAdventures = form.watch("adventures");
  const isPublicPost = !watchedAdventures || watchedAdventures.length === 0;

  async function onSubmit(values: z.infer<typeof PostSchema>) {
    const allowedIds = [
      "2f9599f6-f734-4ba4-b351-90a5958a90cf",
      "9977be99-cc64-48df-bb5a-42daba635447",
      "09f99d93-9cdc-4dcd-b698-da1574506f6f",
      "b6b5df9c-9d09-4614-9920-684cc0effb7a"
    ];
    if (!allowedIds.includes(user.id)) {
      return toast({
        title: "Erro ao criar post",
        description: "Você não tem permissão para criar posts",
      });
    }

    const adventures = values.adventures || [];

    if (!isAdmin(user) && adventures.length > 0) {
      const userAdventureIds = userAdventures?.documents.map(a => a.$id) || [];
      const canPost = adventures.every(adventureId =>
        userAdventureIds.includes(adventureId)
      );

      if (!canPost) {
        return toast({
          title: "Erro de permissão",
          description: "Você só pode criar posts em aventuras onde participa",
        });
      }
    }

    const captionImageIds = extractImageIdsFromCaption(values.captions);

    if (post && action === "update") {
      const updatedPost = await updatePost({
        ...values,
        captions: prepareCaptions(values.captions),
        postId: post.$id,
        imageId: post.imageId,
        imageUrl: post.imageUrl,
        audioId: post.audioId,
        audioUrl: post.audioUrl,
        adventures: adventures,
        tags: values.tags.join(","),
        captionImageIds: captionImageIds,
      });

      if (!updatedPost)
        return toast({
          title: "Erro ao atualizar post",
          description: "Tente novamente mais tarde",
        });

      return navigate(`/posts/${post.$id}`);
    }

    const newPost = await createPost({
      ...values,
      captions: prepareCaptions(values.captions),
      userId: user.id,
      adventures: adventures,
      tags: values.tags.join(","),
      captionImageIds: captionImageIds,
    });

    if (!newPost)
      return toast({
        title: "Erro ao criar post",
        description: "Tente novamente mais tarde",
      });

    navigate("/");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Titulo</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="captions"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Legenda</FormLabel>
              <FormControl>
                <TinyMCEEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Digite sua legenda aqui... Use as ferramentas acima ou cole imagens diretamente."
                  className="w-full"
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Fotos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="audioFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Áudio (Opcional)
              </FormLabel>
              <FormControl>
                <AudioUploader
                  fieldChange={field.onChange}
                  audioUrl={post?.audioUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* CAMPO AVENTURAS - AGORA OPCIONAL */}
        <FormField
          control={form.control}
          name="adventures"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Aventuras (Opcional)
              </FormLabel>
              <FormControl>
                {isLoadingAdventures ? (
                  <div className="flex items-center justify-center h-12 bg-dark-4 rounded-md">
                    <Loader size="sm" />
                    <span className="ml-2 text-light-4 text-sm">Carregando aventuras...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AdventureMultiSelect
                      adventures={userAdventures?.documents || []}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Selecione aventuras específicas ou deixe vazio para post público..."
                      error={form.formState.errors.adventures?.message}
                    />

                    {/* Indicador de Visibilidade */}
                    <div className={`p-3 rounded-lg border transition-colors ${isPublicPost
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-green-500/10 border-green-500/30'
                      }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {isPublicPost ? '🌍' : '🔒'}
                        </span>
                        <span className={`font-medium ${isPublicPost ? 'text-blue-400' : 'text-green-400'
                          }`}>
                          {isPublicPost ? 'Post Público' : 'Post Restrito'}
                        </span>
                      </div>
                      <p className="text-xs text-light-4">
                        {isPublicPost
                          ? 'Este post será visível para todos os usuários da plataforma'
                          : `Este post será visível apenas para participantes das ${field.value?.length || 0} aventura(s) selecionada(s)`
                        }
                      </p>
                    </div>
                  </div>
                )}
              </FormControl>
              <FormMessage className="shad-form_message" />
              {!isAdmin(user) && (
                <p className="text-light-4 text-sm mt-1">
                  {isPublicPost
                    ? 'Posts públicos são visíveis para todos'
                    : 'Você só pode postar em aventuras onde participa'
                  }
                </p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Selecionar Tags</FormLabel>
              <FormControl>
                <MultiSelect
                  options={availableTags}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Selecione as tags para o post..."
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isCreating || isUpdating || isLoadingAdventures}
          >
            {isCreating || isUpdating ? (
              <div className="flex-center">
                <Loader />
              </div>
            ) : (
              <>{action === "create" ? "Enviar" : "Atualizar"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;