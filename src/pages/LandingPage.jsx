import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, LogOut, User, BookOpen, Award, Clock, Users, MessageSquare, Zap, Moon, Sun } from "lucide-react"

const features = [
  {
    title: "Expert Instructors",
    description: "Learn from experienced educators who specialize in your subject area",
    icon: <Award className="h-8 w-8 text-indigo-600" />,
  },
  {
    title: "Interactive Learning",
    description: "Engage with course materials through quizzes, exercises, and live sessions",
    icon: <Zap className="h-8 w-8 text-indigo-600" />,
  },
  {
    title: "Study Groups",
    description: "Connect with peers for collaborative learning and problem-solving",
    icon: <Users className="h-8 w-8 text-indigo-600" />,
  },
  {
    title: "Practice Tests",
    description: "Prepare for exams with our comprehensive practice materials",
    icon: <BookOpen className="h-8 w-8 text-indigo-600" />,
  },
  {
    title: "Flexible Schedule",
    description: "Access course materials anytime, anywhere to fit your learning pace",
    icon: <Clock className="h-8 w-8 text-indigo-600" />,
  },
  {
    title: "Personal Guidance",
    description: "Get personalized feedback and support from dedicated mentors",
    icon: <MessageSquare className="h-8 w-8 text-indigo-600" />,
  },
]

function LandingPage() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);


  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData)); 
    }
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Improved navbar with better light mode styling */}
      <nav className="bg-white shadow-md sticky top-0 z-10 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <BookOpen className="h-8 w-8 text-indigo-600 mr-2" />
                <h1 className="text-2xl font-bold text-indigo-600 dark:text-white">EduCoach</h1>
              </Link>
            </div>
            
            <div className="hidden md:flex space-x-6">
              <Link to="/courses" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-white">
                Courses
              </Link>
              <Link to="/teachers" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-white">
                Teachers
              </Link>
              <Link to="/resources" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-white">
                Resources
              </Link>
              <Link to="/faq" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-white">
                FAQs
              </Link>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-md text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              {isLoggedIn ? (
                <>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <User className="h-4 w-4 mr-2" />
                    <span className="mr-4 font-medium">{user?.name || 'Student'}</span>
                  </div>
                  <Link
                    to="/dashboard"
                    className="hidden md:flex items-center text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium dark:text-white dark:hover:text-indigo-300"
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-white"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/teacher/login"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-white"
                  >
                    Teacher Login
                  </Link>
                  <Link
                    to="/student/login"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-white"
                  >
                    Student Login
                  </Link>
                  <Link
                    to="/student/signup"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section - unchanged color scheme works well in both modes */}
      <div className="relative bg-indigo-800 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-indigo-700 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:w-2/3">
            <h2 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
              <span className="block">Achieve Academic</span>
              <span className="block text-indigo-300">Excellence</span>
            </h2>

            <p className="mt-6 max-w-lg text-xl text-indigo-100">
              Personalized coaching to help you excel in your studies. 
              Our expert educators and tailored learning paths will guide you to success.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 dark:bg-gray-100 dark:text-indigo-800"
                >
                  Go to My Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/student/signup"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 dark:bg-gray-100 dark:text-indigo-800"
                  >
                    Start Learning
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/courses"
                    className="flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    Explore Courses
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats section - improved light mode styling */}
      <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-indigo-50'} py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">10k+</p>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Students</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">95%</p>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Success Rate</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">50+</p>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Expert Teachers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">100+</p>
              <p className="mt-2 text-gray-700 dark:text-gray-300">Courses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area - improved light mode styling */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${isDarkMode ? 'dark:bg-gray-800 dark:text-white' : 'bg-white text-gray-800'}`}>
        {/* Features section */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">Why Choose EduCoach?</h3>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600' : 'bg-white border border-indigo-100 shadow-md'} rounded-xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-4 p-3 ${isDarkMode ? 'bg-indigo-800' : 'bg-indigo-100'} rounded-full`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Courses section - improved light mode styling */}
        <div className="my-24">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">Popular Courses</h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Course 1 */}
            <div className={`${isDarkMode ? 'dark:bg-gray-700' : 'bg-white shadow-lg'} rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300`}>
              <div className="h-48 bg-indigo-200 flex items-center justify-center dark:bg-indigo-900">
                <BookOpen className="h-16 w-16 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs font-medium text-indigo-600 ${isDarkMode ? 'dark:bg-indigo-800 dark:text-indigo-300' : 'bg-indigo-100'} px-3 py-1 rounded-full`}>Mathematics</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">4.9 ★</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 dark:text-white">Advanced Calculus</h4>
                <p className="text-gray-600 text-sm mb-4 dark:text-gray-300">Master derivatives, integrals, and applications with our comprehensive course.</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-600 dark:text-indigo-300">12 Weeks</span>
                  <Link to="/course/calculus" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium dark:text-indigo-300 dark:hover:text-indigo-400">View Details →</Link>
                </div>
              </div>
            </div>
            
            {/* Course 2 */}
            <div className={`${isDarkMode ? 'dark:bg-gray-700' : 'bg-white shadow-lg'} rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300`}>
              <div className="h-48 bg-green-200 flex items-center justify-center dark:bg-green-900">
                <BookOpen className="h-16 w-16 text-green-600 dark:text-green-300" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs font-medium text-green-600 ${isDarkMode ? 'dark:text-green-300 dark:bg-green-800' : 'bg-green-100'} px-3 py-1 rounded-full`}>Physics</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">4.8 ★</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 dark:text-white">Mechanics & Dynamics</h4>
                <p className="text-gray-600 text-sm mb-4 dark:text-gray-300">Understand the fundamental principles of motion, forces, and energy.</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-600 dark:text-green-300">10 Weeks</span>
                  <Link to="/course/physics" className="text-green-600 hover:text-green-800 text-sm font-medium dark:text-green-300 dark:hover:text-green-400">View Details →</Link>
                </div>
              </div>
            </div>
            
            {/* Course 3 */}
            <div className={`${isDarkMode ? 'dark:bg-gray-700' : 'bg-white shadow-lg'} rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300`}>
              <div className="h-48 bg-purple-200 flex items-center justify-center dark:bg-purple-900">
                <BookOpen className="h-16 w-16 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs font-medium text-purple-600 ${isDarkMode ? 'dark:text-purple-300 dark:bg-purple-800' : 'bg-purple-100'} px-3 py-1 rounded-full`}>Chemistry</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">4.7 ★</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 dark:text-white">Organic Chemistry</h4>
                <p className="text-gray-600 text-sm mb-4 dark:text-gray-300">Explore carbon compounds, reactions, and laboratory techniques.</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-purple-600 dark:text-purple-300">14 Weeks</span>
                  <Link to="/course/chemistry" className="text-purple-600 hover:text-purple-800 text-sm font-medium dark:text-purple-300 dark:hover:text-purple-400">View Details →</Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <Link to="/courses" className={`inline-flex items-center justify-center px-6 py-3 border ${isDarkMode ? 'dark:text-white dark:border-indigo-300 dark:hover:bg-indigo-700' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'} text-base font-medium rounded-md`}>
              View All Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Testimonials section - improved light mode styling */}
        <div className={`my-24 ${isDarkMode ? 'dark:from-gray-700 dark:to-gray-700' : 'from-indigo-50 to-blue-50'} bg-gradient-to-r rounded-2xl shadow-md p-8`}>
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">Student Success Stories</h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Testimonial 1 */}
            <div className={`${isDarkMode ? 'dark:bg-gray-800' : 'bg-white shadow-lg'} rounded-xl p-8`}>
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-6 dark:text-gray-300">"EduCoach helped me improve my math scores from C to A+. The personalized attention and practice tests were exactly what I needed. My confidence has skyrocketed!"</p>
                </div>
                <div className="flex items-center mt-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-800">
                    <span className="text-indigo-800 font-bold dark:text-indigo-100">AP</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Anisha Patel</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Mathematics Student</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className={`${isDarkMode ? 'dark:bg-gray-800' : 'bg-white shadow-lg'} rounded-xl p-8`}>
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-6 dark:text-gray-300">"The study groups and interactive sessions made learning physics enjoyable. I got accepted to my dream university thanks to the preparation I received at EduCoach."</p>
                </div>
                <div className="flex items-center mt-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-800">
                    <span className="text-indigo-800 font-bold dark:text-indigo-100">MK</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Michael Kim</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Physics Student</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-indigo-700 rounded-2xl p-12 text-center text-white mt-20">
          <h3 className="text-3xl font-bold mb-6">Ready to Transform Your Academic Journey?</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of students who have achieved their academic goals with EduCoach.</p>
          <Link
            to="/student/signup"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </main>


      <footer className="bg-gray-800 text-white mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-indigo-400 mr-2" />
                <h3 className="text-xl font-bold">EduCoach</h3>
              </div>
              <p className="text-gray-300">Empowering students to reach their full academic potential through personalized coaching.</p>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            

            <div>
              <h4 className="text-lg font-medium mb-4">Student Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Study Materials</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Practice Tests</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Live Classes</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Study Groups</a></li>
              </ul>
            </div>
            

            <div>
              <h4 className="text-lg font-medium mb-4">Programs</h4>
              <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Mathematics</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Physics</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Chemistry</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Biology</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Computer Science</a></li>
              </ul>
            </div>
            

            <div>
              <h4 className="text-lg font-medium mb-4">Contact & Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          

          <div className="mt-12 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-300">© {new Date().getFullYear()} EduCoach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;