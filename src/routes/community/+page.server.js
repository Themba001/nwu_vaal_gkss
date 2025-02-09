
export const actions =   {
    addTopic: async ({locals: {supabase}, request}) => {
        const {data: {user}} = await supabase.auth.getUser();
        const {data:Member,error} = await supabase.from("Member").select().eq("id",user.id);
        if(error){
            console.error(error)
        }else{
            //making a post
            const formData = await request.formData();
            const {data,error} = await supabase.from("Forum_topic").insert({
                topic: formData.get("topic"),
                content: formData.get("content"),
                tags: formData.get("tags"),
                author_id: user.id,
                author_username: Member.username,
            })
    
            if(error){
                console.error(error)
            }
        }
        
        
    },
    deleteTopic : async ({request, locals: {supabase}}) => {
        const data = await request.formData();
        const id = data.get("id");
        const {error} = await supabase.from("Forum_topic").delete().eq("id",id);
        if(error){
            console.error(error);
        }
    }
}