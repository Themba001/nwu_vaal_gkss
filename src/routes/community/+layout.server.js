export async function load({locals: {supabase}}) {
    const {data: {user}} = await supabase.auth.getUser();
    let finalArray = [];
    const {data: Forum_topic, error} = await supabase.from("Forum_topic").select("id,content,created_at,tags,topic, Member(username,image),Comment(*,Member(username, image)),topic_views(*),topic_images(image)").order('created_at', { ascending: false });
    if(error){
        console.error(error)
    }
    let allTopics = [];
    for(let topic of Forum_topic){
        //for member profile images
        let publicUrl = await supabase.storage.from("files").getPublicUrl(topic.Member.image.substring(topic.Member.image.indexOf("/")+1));//removing the first "file/"
        topic = {...topic,Member: {image: publicUrl.data.publicUrl, username: topic.Member.username}}
        //for topic images
        const finalImages = [];
        for(const file of topic.topic_images){
            let publicUrl = await supabase.storage.from("files").getPublicUrl(file.image);
            finalImages.push(publicUrl.data.publicUrl);
        }
        topic = {...topic, topic_images: finalImages};
        //for comments
        const comments = [];
        for(let comment of topic.Comment){
            let publicUrl = await supabase.storage.from("files").getPublicUrl(comment.Member.image.substring(topic.Member.image.indexOf("/")));//removing the first "file/"
            comment = {...comment,Member: {image: publicUrl.data.publicUrl, username: comment.Member.username}};
            comments.push(comment)
        }
        topic = {...topic, Comment: comments};
        allTopics.push(topic);
    }
    const {data: Project} = await supabase.from("Project").select("name,image,description,technologies,link,created_at,id,Member(username)").order('created_at', { ascending: false });
    let projects = [];
    for(const project of Project){
        let publicUrl = await supabase.storage.from("files").getPublicUrl(project.image.substring(project.image.indexOf("/")+1));//removing the first "file/"
        const {data: Project_rating} = await supabase.from("Project_rating").select("rating,Member(id)").eq("project_id",project.id);
        let rating = Project_rating;
        projects.push({...project,image: publicUrl.data.publicUrl,rating: rating})
    }
    let email = null;
    if(user != null){
        email = user.email
    }
    else{
        email =   null;
    }
    //before returning the data, make objects for most viewed, latest
    const latest = allTopics.slice(0, 3);//as it is, just take the top 3
    
    //for most viewed
    let most_viewed = allTopics.sort((a, b) => b.topic_views.length - a.topic_views.length);
    most_viewed = most_viewed.sort((a, b) => b.Comment.length - a.Comment.length).slice(0, 3);


    return {email,latest,most_viewed, allTopics, projects};

}

