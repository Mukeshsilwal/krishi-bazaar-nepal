import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sprout, 
  Phone, 
  Lock, 
  Globe, 
  Eye, 
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const AdminLoginPage = () => {
  const { language, setLanguage } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    mobileOrEmail: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.mobileOrEmail, formData.password);
      toast.success(language === 'ne' ? 'लगइन सफल!' : 'Login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(language === 'ne' ? 'लगइन असफल। कृपया पुन: प्रयास गर्नुहोस्।' : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      {/* Language Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setLanguage(language === 'ne' ? 'en' : 'ne')}
        className="fixed top-4 right-4 gap-2"
      >
        <Globe className="h-4 w-4" />
        {language === 'ne' ? 'English' : 'नेपाली'}
      </Button>

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Sprout className="w-12 h-12 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Kisan Sarathi</h1>
              <p className="text-lg text-muted-foreground">किसान सारथी</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold">
            {language === 'ne' ? 'व्यवस्थापक लगइन' : 'Admin Login'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'ne' 
              ? 'आफ्नो खातामा लगइन गर्नुहोस्'
              : 'Sign in to your admin account'}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mobile/Email Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ne' ? 'मोबाइल नम्बर / इमेल' : 'Mobile Number / Email'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={formData.mobileOrEmail}
                  onChange={e => setFormData({ ...formData, mobileOrEmail: e.target.value })}
                  placeholder={language === 'ne' ? '९८XXXXXXXX वा इमेल' : '98XXXXXXXX or email'}
                  className="pl-11 h-12 text-lg"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'ne' ? 'पासवर्ड' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 text-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                {language === 'ne' ? 'पासवर्ड बिर्सनुभयो?' : 'Forgot Password?'}
              </Link>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-lg gap-2"
              disabled={loading}
            >
              {loading ? (
                language === 'ne' ? 'लगइन हुँदैछ...' : 'Signing in...'
              ) : (
                <>
                  {language === 'ne' ? 'लगइन गर्नुहोस्' : 'Sign In'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {language === 'ne' ? '← गृहपृष्ठमा फर्कनुहोस्' : '← Back to Home'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
