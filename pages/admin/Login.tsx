import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bike, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Label } from '../../components/ui/core';
import { authService } from '../../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { user, error } = await authService.login(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (user) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-300 relative">
      {/* Back to Site Button */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link to="/">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar para o Site
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-md bg-card border-border shadow-xl !shadow-sm hover:!shadow-sm hover:!translate-y-0 !transition-none">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Bike className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            ML<span className="text-primary">ADMIN</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Acesso restrito à área administrativa</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{error}</p>
                    {error.includes('Email ou senha incorretos') && (
                      <p className="text-xs mt-2 text-red-600 dark:text-red-300">
                        💡 Dica: Verifique se o Caps Lock está desativado e se você está usando as credenciais corretas.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  className="pl-10 bg-background border-input text-foreground focus:bg-background" 
                  placeholder="admin@mlmotoscar.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10 bg-background border-input text-foreground focus:bg-background"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full shadow-md font-semibold" disabled={loading}>
              {loading ? 'Autenticando...' : 'Entrar no Sistema'}
            </Button>

            <div className="text-center">
                <p className="text-xs text-muted-foreground">
                    Credenciais de Demo: admin@mlmotoscar.com / admin
                </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
