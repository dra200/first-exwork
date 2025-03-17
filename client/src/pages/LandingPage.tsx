import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Zap, Shield, LayoutDashboard, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Navigation Bar */}
      <header className="w-full py-5 px-4 md:px-10 bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center mr-2">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <h1 className="text-xl font-bold text-primary">TechConnect</h1>
          </div>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button variant="outline" className="border-primary text-primary">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-10 container mx-auto">
        <div className="md:max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Connecting Businesses with Top Tech Talent, Effortlessly.
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A B2B platform for businesses to find and hire top-rated tech service providers, helping them complete projects faster, with trusted professionals.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/register">
              <Button className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-lg">
                Get Started Today
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute right-10 top-20 hidden lg:block">
          <div className="h-96 w-96 rounded-full bg-primary opacity-5"></div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 px-4 md:px-10 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How TechConnect Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform revolutionizes how businesses hire tech talent. Whether you're looking for AI developers, cybersecurity experts, or software engineers, our AI-powered system ensures that you're matched with the right provider for your project. Create, manage, and track your projects in one place.
            </p>
          </div>
          <div className="relative">
            <div className="h-2 bg-gray-100 absolute top-1/2 left-0 right-0 transform -translate-y-1/2 hidden md:block"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md relative">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Post Your Project</h3>
                <p className="text-gray-600">Describe your project needs, set a budget, and specify your timeline.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md relative">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Receive Proposals</h3>
                <p className="text-gray-600">Get detailed proposals from qualified service providers.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md relative">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Select Your Provider</h3>
                <p className="text-gray-600">Choose the best provider based on expertise, price, and timeline.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md relative">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold text-xl">4</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Manage Your Project</h3>
                <p className="text-gray-600">Track progress, communicate, and make secure payments.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-10 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              TechConnect offers powerful features designed to streamline the process of connecting businesses with tech talent.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI-Powered Matching</h3>
                <p className="text-gray-600">
                  Effortlessly match with the right service provider based on your project's needs.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Streamlined Project Management</h3>
                <p className="text-gray-600">
                  Manage your projects, track progress, and communicate with your provider from start to finish.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Secure Payment Processing</h3>
                <p className="text-gray-600">
                  Seamless and secure payment processing with a built-in 15% platform commission.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Dedicated Dashboards</h3>
                <p className="text-gray-600">
                  Custom dashboards for both buyers and sellers to manage their workflows.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 md:px-10 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Hear from businesses and service providers who have used TechConnect.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-8">
                <div className="mb-4">
                  <svg width="100" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {[...Array(5)].map((_, i) => (
                      <path
                        key={i}
                        d="M9.5 14.25l-5.584 2.936 1.066-6.218L.465 6.564l6.243-.907L9.5 0l2.792 5.657 6.243.907-4.517 4.404 1.066 6.218z"
                        transform={`translate(${i * 20}, 0)`}
                        fill="#2563EB"
                      />
                    ))}
                  </svg>
                </div>
                <p className="text-gray-600 italic mb-6">
                  "TechConnect helped us find the perfect team for our AI project. The platform's user interface is so intuitive, and the communication was seamless!"
                </p>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-primary font-bold">
                    JD
                  </div>
                  <div>
                    <p className="font-bold">Jane Doe</p>
                    <p className="text-sm text-gray-500">CEO of Tech Innovations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-8">
                <div className="mb-4">
                  <svg width="100" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {[...Array(5)].map((_, i) => (
                      <path
                        key={i}
                        d="M9.5 14.25l-5.584 2.936 1.066-6.218L.465 6.564l6.243-.907L9.5 0l2.792 5.657 6.243.907-4.517 4.404 1.066 6.218z"
                        transform={`translate(${i * 20}, 0)`}
                        fill="#2563EB"
                      />
                    ))}
                  </svg>
                </div>
                <p className="text-gray-600 italic mb-6">
                  "As a freelance developer, TechConnect has been vital for finding consistent clients. The payment process is transparent and I get paid on time, every time."
                </p>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-primary font-bold">
                    MS
                  </div>
                  <div>
                    <p className="font-bold">Michael Smith</p>
                    <p className="text-sm text-gray-500">Full-Stack Developer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-16 px-4 md:px-10 bg-primary text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-white/90 text-lg">
                Empower businesses by simplifying the process of connecting with top-tier tech talent, and enabling seamless collaboration for tech solutions that matter.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-white/90 text-lg">
                To be the leading platform for businesses and tech service providers, making tech hiring efficient, secure, and accessible globally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-10 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Tech Match?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Sign up now to post your first project and start connecting with skilled tech service providers.
          </p>
          <Link href="/register">
            <Button className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-lg">
              Sign Up Now to Post Your First Project <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 md:px-10 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-md bg-white flex items-center justify-center mr-2">
                  <span className="text-primary font-bold text-xl">T</span>
                </div>
                <h3 className="text-xl font-bold">TechConnect</h3>
              </div>
              <p className="text-white/70">
                Connecting businesses with top tech talent, effortlessly.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white">How It Works</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Features</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-white/70 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-white/50">
            <p>© {new Date().getFullYear()} TechConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;