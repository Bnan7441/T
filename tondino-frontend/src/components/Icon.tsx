import React from 'react';
import {
  X,
  Bell,
  BookOpen,
  Award,
  Ghost,
  Trophy,
  Zap,
  Flame,
  ArrowRight,
  ArrowLeft,
  Share2,
  Bookmark,
  Lightbulb,
  Brain,
  Wand2,
  Crown,
  Shapes,
  Book,
  GraduationCap,
  User,
  Users,
  Clock,
  List,
  Paperclip,
  File,
  FileText,
  Play,
  ChevronRight,
  ChevronLeft,
  Download,
  CheckCircle,
  Check,
  Circle,
  Plus,
  Phone,
  Apple,
  Instagram,
  Linkedin,
  Twitter,
  Send,
  MessageCircle, // For generic chat/comments
  Languages,
  FlaskConical,
  Stethoscope,
  Bot,
  Star,
  Calendar,
  Image,
  Landmark,
  School,
  Activity,
  Gem,
  Medal,
  MapPin,
  Mail,
  Presentation,
  Search,
  /* Google icon removed because lucide-react may not export it */
} from 'lucide-react';

import { mapFaToLucide } from '@/utils/iconMap';

type Props = React.SVGProps<SVGSVGElement> & { fa?: string; className?: string };

const Icon: React.FC<Props> = ({ fa = '', className = '', ...rest }) => {
  // improved key extraction to handle "fa-solid fa-book" etc.
  const customKey = React.useMemo(() => {
    const classes = fa.split(' ');
    const iconClass = classes.find(c => 
      c.startsWith('fa-') && 
      !['fa-solid', 'fa-regular', 'fa-light', 'fa-thin', 'fa-duotone', 'fa-brands', 'fa-lg', 'fa-xl', 'fa-2x', 'fa-spin', 'fa-pulse', 'fa-fw'].includes(c)
    );
    return iconClass ? iconClass.replace(/^fa-/, '') : fa.replace(/^fa-/, '');
  }, [fa]);
  
  const key = customKey.trim();
  const resolved = mapFaToLucide(fa);
  const dataAttr = resolved ? { ['data-lucide']: resolved } : {};
  const render = (Comp: React.ElementType) => <Comp className={className} {...rest} {...(dataAttr as any)} />;

  switch (key) {
    case 'xmark':
    case 'x':
    case 'times':
      return render(X);
    case 'bell':
      return render(Bell);
    case 'book-open':
      return render(BookOpen);
    case 'award':
      return render(Award);
    case 'ghost':
      return render(Ghost);
    case 'trophy':
      return render(Trophy);
    case 'bolt':
    case 'zap':
      return render(Zap);
    case 'fire':
      return render(Flame);
    case 'arrow-right':
    case 'arrow-right-long':
      return render(ArrowRight);
    case 'arrow-left':
      return render(ArrowLeft);
    case 'share-nodes':
    case 'share':
      return render(Share2);
    case 'bookmark':
      return render(Bookmark);
    case 'lightbulb':
    case 'light-bulb':
      return render(Lightbulb);
    case 'brain':
      return render(Brain);
    case 'wand-magic-sparkles':
    case 'wand':
    case 'magic':
      return render(Wand2);
    case 'crown':
      return render(Crown);
    case 'shapes':
      return render(Shapes);
    case 'book':
      return render(Book);
    case 'graduation-cap':
    case 'user-graduate':
      return render(GraduationCap);
    case 'user-tie':
    case 'user':
      return render(User);
    case 'users':
      return render(Users);
    case 'clock':
      return render(Clock);
    case 'list-ul':
    case 'list':
      return render(List);
    case 'paperclip':
      return render(Paperclip);
    case 'file-pdf':
      return render(FileText);
    case 'file':
      return render(File);
    case 'play':
      return render(Play);
    case 'chevron-right':
      return render(ChevronRight);
    case 'chevron-left':
      return render(ChevronLeft);
    case 'download':
    case 'arrow-up-from-bracket':
      return render(Download);
    case 'check-circle':
    case 'circle-check':
      return render(CheckCircle);
    case 'check-double':
    case 'check':
      return render(Check);
    case 'plus':
      return render(Plus);
    case 'mobile-screen':
    case 'mobile-screen-button':
      return render(Phone);
    case 'apple':
      return render(Apple);
    
    // New mappings for previously missing icons
    case 'language':
      return render(Languages);
    case 'flask':
      return render(FlaskConical);
    case 'user-doctor':
      return render(Stethoscope); // or User with badge
    case 'robot':
      return render(Bot);
    case 'star':
      return render(Star);
    case 'school':
      return render(School);
    case 'child-reaching':
      return render(Activity);
    case 'university':
    case 'building-columns':
      return render(Landmark);

    case 'calendar':
      return render(Calendar);
    
    // Additional mappings
    case 'gem':
      return render(Gem);
    case 'medal':
      return render(Medal);
    case 'location-dot':
      return render(MapPin);
    case 'envelope':
      return render(Mail);
    case 'chalkboard-user':
      return render(Presentation);
    case 'angle-right':
      return render(ChevronRight);
    case 'angle-left':
      return render(ChevronLeft);

    // Social / Brands
    case 'instagram':
      return render(Instagram);
    case 'linkedin':
    case 'linkedin-in':
      return render(Linkedin);
    case 'twitter':
    case 'x-twitter':
      return render(Twitter);
    case 'telegram':
      return render(Send);
    case 'whatsapp':
      return render(Phone); // Or MessageCircle if preferred

    case 'google-play':
    case 'google':
      // Custom SVG for Google G logo
      return (
        <svg 
          viewBox="0 0 24 24" 
          width="24" 
          height="24" 
          className={className}
          fill="currentColor"
          {...rest}
        >
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.147-1.133 8.213-3.293 2.1-2.107 2.747-5.32 2.747-7.96 0-.787-.08-1.507-.227-2.2H12.48z" />
        </svg>
      );
      
    case 'signal':
    case 'chart-simple':
      return render(ArrowRight); // Fallback for signal/level icon

    case 'certificate':
      return render(Award);

    case 'layer-group':
      return render(Shapes); // or Layers if available, Shapes is a good fallback
    
    case 'gauge-high':
      return render(Zap); // Speed test

    case 'triangle-exclamation':
      return render(Flame); // Warning icon fallback

    case 'quote-right':
      return render(MessageCircle);
      
    case 'headset':
      return render(Stethoscope);
      
    case 'magnifying-glass':
    case 'search':
        return render(Search);

    case 'video-slash':
      return render(Ghost);

    default:
      console.warn(`Icon not found: ${key} (derived from ${fa})`);
      return render(Circle);
  }
};

export default Icon;
