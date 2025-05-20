import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Bell, Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMobile } from '@/hooks/use-mobile';

export function Header() {
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMobile();
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Get user's initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="bg-secondary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="mr-4">
            <Link href="/">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center cursor-pointer">
                <span className="font-accent font-bold text-xl">BT</span>
              </div>
            </Link>
          </div>
          <h1 className="font-heading font-bold text-2xl hidden md:block">BasketTeam</h1>
        </div>
        
        {/* Public Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className={`font-semibold hover:text-accent transition duration-200 ${location === '/' ? 'text-accent' : ''}`}>
              Início
            </a>
          </Link>
          <Link href="/public/news">
            <a className={`font-semibold hover:text-accent transition duration-200 ${location === '/public/news' ? 'text-accent' : ''}`}>
              Notícias
            </a>
          </Link>
          {user && (
            <Link href="/calendar">
              <a className={`font-semibold hover:text-accent transition duration-200 ${location === '/calendar' ? 'text-accent' : ''}`}>
                Calendário
              </a>
            </Link>
          )}
        </nav>
        
        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {user && (
            <Button variant="ghost" size="icon" className="relative p-2 hover:bg-secondary-light rounded-full transition duration-200">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 bg-primary rounded-full w-4 h-4 text-xs flex items-center justify-center">
                {user.notifications || 0}
              </span>
            </Button>
          )}
          
          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-secondary-light">
                  <Avatar className="w-8 h-8 border-2 border-accent">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-white">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block">{user.name}</span>
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Meu Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" className="bg-primary hover:bg-primary-dark text-white border-none">
              <Link href="/auth">Entrar</Link>
            </Button>
          )}
          
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden p-1"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="md:hidden bg-secondary-dark mt-4 rounded-md p-4 slide-in">
          <nav className="flex flex-col space-y-3">
            <Link href="/">
              <a className="font-semibold hover:text-accent transition duration-200">Início</a>
            </Link>
            <Link href="/public/news">
              <a className="font-semibold hover:text-accent transition duration-200">Notícias</a>
            </Link>
            {user && (
              <>
                <Link href="/calendar">
                  <a className="font-semibold hover:text-accent transition duration-200">Calendário</a>
                </Link>
                <Link href="/training">
                  <a className="font-semibold hover:text-accent transition duration-200">Treino do Dia</a>
                </Link>
                <Link href="/exercise-log">
                  <a className="font-semibold hover:text-accent transition duration-200">Registrar Exercícios</a>
                </Link>
                <Link href="/history">
                  <a className="font-semibold hover:text-accent transition duration-200">Meu Histórico</a>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
