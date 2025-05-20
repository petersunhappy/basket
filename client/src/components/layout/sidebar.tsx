import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  HomeIcon, 
  ClockIcon, 
  PlusIcon, 
  ListIcon, 
  CalendarIcon, 
  MessageSquareIcon, 
  UserIcon,
  UsersIcon,
  ClipboardIcon,
  BarChartIcon
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className="w-64 bg-secondary text-white hidden md:block" id="sidebar">
      <div className="p-4 space-y-6">
        <h2 className="font-heading font-bold text-lg border-b border-secondary-light pb-2">Menu Principal</h2>
        
        <nav>
          <ul className="space-y-1">
            <li>
              <Link href="/">
                <a className={`flex items-center px-4 py-3 rounded-md transition duration-200 ${
                  isActive('/') 
                    ? 'bg-secondary-light text-accent font-semibold' 
                    : 'hover:bg-secondary-light'
                }`}>
                  <HomeIcon className="h-5 w-5 mr-3" />
                  Meu Dashboard
                </a>
              </Link>
            </li>
            <li>
              <Link href="/training">
                <a className={`flex items-center px-4 py-3 rounded-md transition duration-200 ${
                  isActive('/training') 
                    ? 'bg-secondary-light text-accent font-semibold' 
                    : 'hover:bg-secondary-light'
                }`}>
                  <ClockIcon className="h-5 w-5 mr-3" />
                  Treino do Dia
                </a>
              </Link>
            </li>
            <li>
              <Link href="/exercise-log">
                <a className={`flex items-center px-4 py-3 rounded-md transition duration-200 ${
                  isActive('/exercise-log') 
                    ? 'bg-secondary-light text-accent font-semibold' 
                    : 'hover:bg-secondary-light'
                }`}>
                  <PlusIcon className="h-5 w-5 mr-3" />
                  Registrar Exercícios
                </a>
              </Link>
            </li>
            <li>
              <Link href="/history">
                <a className={`flex items-center px-4 py-3 rounded-md transition duration-200 ${
                  isActive('/history') 
                    ? 'bg-secondary-light text-accent font-semibold' 
                    : 'hover:bg-secondary-light'
                }`}>
                  <ListIcon className="h-5 w-5 mr-3" />
                  Meu Histórico
                </a>
              </Link>
            </li>
            <li>
              <Link href="/calendar">
                <a className={`flex items-center px-4 py-3 rounded-md transition duration-200 ${
                  isActive('/calendar') 
                    ? 'bg-secondary-light text-accent font-semibold' 
                    : 'hover:bg-secondary-light'
                }`}>
                  <CalendarIcon className="h-5 w-5 mr-3" />
                  Calendário
                </a>
              </Link>
            </li>
            <li>
              <Link href="/news">
                <a className={`flex items-center px-4 py-3 rounded-md transition duration-200 ${
                  isActive('/news') 
                    ? 'bg-secondary-light text-accent font-semibold' 
                    : 'hover:bg-secondary-light'
                }`}>
                  <MessageSquareIcon className="h-5 w-5 mr-3" />
                  Notícias Internas
                </a>
              </Link>
            </li>
            <li>
              <Link href="/profile">
                <a className={`flex items-center px-4 py-3 rounded-md transition duration-200 ${
                  isActive('/profile') 
                    ? 'bg-secondary-light text-accent font-semibold' 
                    : 'hover:bg-secondary-light'
                }`}>
                  <UserIcon className="h-5 w-5 mr-3" />
                  Meu Perfil
                </a>
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Coach/Admin Only Section */}
        {user.role === 'coach' && (
          <div className="border-t border-secondary-light pt-4">
            <h3 className="font-heading font-bold text-sm text-neutral-light pb-2">ÁREA DO TREINADOR</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/admin/athletes">
                  <a className={`flex items-center px-4 py-3 rounded-md transition duration-200 ${
                    isActive('/admin/athletes') 
                      ? 'bg-secondary-light text-accent font-semibold' 
                      : 'hover:bg-secondary-light'
                  }`}>
                    <UsersIcon className="h-5 w-5 mr-3" />
                    Gestão de Atletas
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/admin/training">
                  <a className={`flex items-center px-4 py-3 rounded-md transition duration-200 ${
                    isActive('/admin/training') 
                      ? 'bg-secondary-light text-accent font-semibold' 
                      : 'hover:bg-secondary-light'
                  }`}>
                    <ClipboardIcon className="h-5 w-5 mr-3" />
                    Criar Treinos
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/admin/reports">
                  <a className={`flex items-center px-4 py-3 rounded-md transition duration-200 ${
                    isActive('/admin/reports') 
                      ? 'bg-secondary-light text-accent font-semibold' 
                      : 'hover:bg-secondary-light'
                  }`}>
                    <BarChartIcon className="h-5 w-5 mr-3" />
                    Relatórios
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
