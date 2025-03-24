import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SuccessStory {
  image: string;
  category: string;
  title: string;
  description: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    initials: string;
  }
}

const successStories: SuccessStory[] = [
  {
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    category: "Student Success",
    title: "From Financial Struggle to Medical School",
    description: "Maria was struggling to pay for her pre-med courses until she connected with a corporate sponsor through EduBridge.",
    author: {
      name: "Maria Rodriguez",
      role: "Medical Student",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      initials: "MR"
    }
  },
  {
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80",
    category: "Student Success",
    title: "Breaking into Tech with Community Support",
    description: "David found both funding and mentorship through EduBridge, helping him complete his computer science degree.",
    author: {
      name: "David Kim",
      role: "Software Engineer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      initials: "DK"
    }
  },
  {
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    category: "Sponsor Story",
    title: "Creating Future Leaders Through Education",
    description: "TechForward has sponsored 50+ STEM students through EduBridge, creating a pipeline of diverse talent.",
    author: {
      name: "Sarah Johnson",
      role: "CSR Director, TechForward",
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      initials: "SJ"
    }
  }
];

const SuccessStories = () => {
  return (
    <div id="success-stories" className="bg-gray-50 pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary tracking-wide uppercase">Success Stories</h2>
          <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">Real stories, real impact</p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">See how EduBridge has helped students achieve their educational dreams.</p>
        </div>

        <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
          {successStories.map((story, index) => (
            <Card key={index} className="flex flex-col overflow-hidden">
              <div className="flex-shrink-0">
                <img className="h-48 w-full object-cover" src={story.image} alt={story.title} />
              </div>
              <CardContent className="flex-1 p-6">
                <p className={`text-sm font-medium ${story.category.includes('Sponsor') ? 'text-amber-600' : 'text-primary'}`}>
                  {story.category}
                </p>
                <a href="#" className="block mt-2">
                  <p className="text-xl font-semibold text-gray-900">{story.title}</p>
                  <p className="mt-3 text-base text-gray-500">{story.description}</p>
                </a>
              </CardContent>
              <CardFooter className="px-6 pt-0 pb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="sr-only">{story.author.name}</span>
                    <Avatar>
                      <AvatarImage src={story.author.avatar} alt={story.author.name} />
                      <AvatarFallback>{story.author.initials}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{story.author.name}</p>
                    <p className="text-sm text-gray-500">{story.author.role}</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
