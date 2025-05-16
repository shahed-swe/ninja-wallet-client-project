import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Course, Lesson, UserCourseProgress } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, Trophy, BookOpen, AlertTriangle, Star, ChevronRight, Lock } from "lucide-react";

export default function CoursesPage() {
  const [selectedTab, setSelectedTab] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Fetch all available courses
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Fetch user's course progress if authenticated
  const { data: userProgress } = useQuery<UserCourseProgress[]>({
    queryKey: ["/api/user/progress"],
    enabled: !!user,
  });

  // Track courses by their status
  const completedCourses = userProgress?.filter((progress: UserCourseProgress) => progress.isCompleted) || [];
  const inProgressCourses = userProgress?.filter((progress: UserCourseProgress) => !progress.isCompleted && progress.progress > 0) || [];

  // Get course progress percentage for a specific course
  const getCourseProgress = (courseId: number) => {
    if (!userProgress) return 0;
    const progress = userProgress.find((p: UserCourseProgress) => p.courseId === courseId);
    return progress ? progress.progress : 0;
  };

  // Filter courses based on the selected tab
  const filteredCourses = courses?.filter(course => {
    if (selectedTab === "completed") {
      return completedCourses.some((p: UserCourseProgress) => p.courseId === course.id);
    }
    if (selectedTab === "in-progress") {
      return inProgressCourses.some((p: UserCourseProgress) => p.courseId === course.id);
    }
    if (selectedTab === "premium") {
      return course.isPremium;
    }
    if (selectedTab === "free") {
      return !course.isPremium;
    }
    return true; // "all" tab shows everything
  });

  // Helper function to get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Start a course
  const startCourse = (course: Course) => {
    if (course.isPremium && !user?.isPremium) {
      toast({
        title: "Premium Content",
        description: "This course requires a premium subscription. Upgrade to access this content.",
        variant: "destructive"
      });
      return;
    }
    navigate(`/courses/${course.id}`);
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Financial Education</h1>
          <p className="text-muted-foreground mt-2">
            Learn essential financial skills to maximize your money's potential
          </p>
        </div>

        {user && (
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <Link href="/courses/achievements">
              <Button variant="outline" className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>My Achievements</span>
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Tabs defaultValue="all" className="mb-8" onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          {user && (
            <>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </>
          )}
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab}>
          {filteredCourses?.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                {selectedTab === "completed" && "You haven't completed any courses yet."}
                {selectedTab === "in-progress" && "You haven't started any courses yet."}
                {(selectedTab === "all" || selectedTab === "free" || selectedTab === "premium") && "No courses available in this category."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses?.map((course) => {
                const progress = getCourseProgress(course.id);
                const isInProgress = progress > 0 && progress < 100;
                const isCompleted = progress === 100;

                return (
                  <Card key={course.id} className="overflow-hidden">
                    {course.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={course.imageUrl} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        {course.isPremium && (
                          <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                            <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                        {isCompleted && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {isInProgress && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <BookOpen className="h-3 w-3 mr-1" />
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-muted-foreground text-sm">{course.description}</p>
                      
                      {isInProgress && (
                        <div className="mt-4">
                          <div className="relative pt-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-semibold inline-block text-primary">
                                  {Math.round(progress)}% Complete
                                </span>
                              </div>
                            </div>
                            <div className="flex h-2 mt-1 overflow-hidden rounded bg-primary/20">
                              <div
                                style={{ width: `${progress}%` }}
                                className="flex flex-col justify-center rounded bg-primary text-xs text-white text-center"
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => startCourse(course)}
                        variant={course.isPremium && !user?.isPremium ? "outline" : "default"}
                      >
                        {isCompleted && "Review Course"}
                        {isInProgress && "Continue Learning"}
                        {!isCompleted && !isInProgress && (course.isPremium && !user?.isPremium ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Unlock Course
                          </>
                        ) : "Start Learning")}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {!user && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-8">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">Sign in to track your progress</h3>
              <p className="text-sm text-amber-700 mt-1">
                Create an account or sign in to save your progress and earn achievements as you complete courses.
              </p>
              <div className="mt-3">
                <Link href="/auth">
                  <Button size="sm" variant="outline">
                    Sign In / Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}