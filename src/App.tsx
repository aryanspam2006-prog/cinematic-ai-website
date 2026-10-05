import { useRef, useState, useCallback } from 'react';
import { ArrowRight, ArrowDown, ChevronUp, Info, X } from 'lucide-react';
import { useVideoScrub } from './useVideoScrub';

const FALLBACK_VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260821_114821_a8ca298f-be2c-4613-a4dd-51b69e16bbde.mp4";

const Stagger = ({ visible, delay, children, className = '' }: { visible: boolean, delay: number, children: React.ReactNode, className?: string }) => (
  <div 
    className={className}
    style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`
    }}
  >
    {children}
  </div>
);

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const s1Ref = useRef<HTMLDivElement>(null);
  const s2Ref = useRef<HTMLDivElement>(null);
  const s3Ref = useRef<HTMLDivElement>(null);

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [isLight, setIsLight] = useState(false);
  const [s1Vis, setS1Vis] = useState(true);
  const [s2Vis, setS2Vis] = useState(false);
  const [s3Vis, setS3Vis] = useState(false);

  const isLightRef = useRef(isLight);
  const s1VisRef = useRef(s1Vis);
  const s2VisRef = useRef(s2Vis);
  const s3VisRef = useRef(s3Vis);

  const onProgress = useCallback((p: number) => {
    const s1 = p < 0.20 ? 1 : Math.max(0, 1 - (p - 0.20) / 0.08);
    const s2 = p < 0.32 ? 0 : p < 0.40 ? (p - 0.32) / 0.08 : p < 0.55 ? 1 : Math.max(0, 1 - (p - 0.55) / 0.08);
    const s3 = p < 0.67 ? 0 : p < 0.75 ? (p - 0.67) / 0.08 : 1;

    if (s1Ref.current) s1Ref.current.style.opacity = s1.toString();
    if (s2Ref.current) s2Ref.current.style.opacity = s2.toString();
    if (s3Ref.current) s3Ref.current.style.opacity = s3.toString();

    const newIsLight = p > 0.55;
    const newS1Vis = s1 > 0.3;
    const newS2Vis = s2 > 0.3;
    const newS3Vis = s3 > 0.3;

    if (isLightRef.current !== newIsLight) {
      isLightRef.current = newIsLight;
      setIsLight(newIsLight);
    }
    if (s1VisRef.current !== newS1Vis) {
      s1VisRef.current = newS1Vis;
      setS1Vis(newS1Vis);
    }
    if (s2VisRef.current !== newS2Vis) {
      s2VisRef.current = newS2Vis;
      setS2Vis(newS2Vis);
    }
    if (s3VisRef.current !== newS3Vis) {
      s3VisRef.current = newS3Vis;
      setS3Vis(newS3Vis);
    }
  }, []);

  useVideoScrub(videoRef, containerRef, onProgress);

  const navColorClass = isLight ? 'text-white' : 'text-dark';
  const navBgClass = isLight ? 'bg-white' : 'bg-dark';

  return (
    <div ref={containerRef} className="relative h-[500vh] w-full bg-black">
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        
        {/* Video */}
        <video 
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          muted 
          playsInline 
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source src="/scrub.mp4" type="video/mp4" />
          <source src={FALLBACK_VIDEO_URL} type="video/mp4" />
        </video>

        {/* UI Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          
          {/* Navbar */}
          <nav className={`absolute top-0 left-0 w-full z-50 pointer-events-auto px-6 sm:px-8 md:px-12 pt-8 sm:pt-12 pb-6 flex items-center justify-between transition-colors duration-500 ${navColorClass}`}>
            
            {/* Desktop Left Nav */}
            <div className="hidden lg:flex items-center gap-8 xl:gap-10">
              {['VECTRUS ENERGY', 'VECTRUS UPSTREAM', 'VECTRUS MARKETS', 'VECTRUS SYSTEMS', 'VECTRUS+'].map((item, i) => (
                <a 
                  key={item} 
                  href="#" 
                  className="relative text-xs tracking-[0.15em] uppercase font-medium hover:opacity-70 transition-opacity"
                  style={{
                    opacity: 0,
                    animation: `navEntrance 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 80 + 100}ms forwards`
                  }}
                >
                  {item}
                  {i === 0 && <span className={`absolute -bottom-3 left-0 w-full h-[2px] ${navBgClass} transition-colors duration-500`} />}
                </a>
              ))}
            </div>

            {/* Mobile Hamburger */}
            <button 
              className="lg:hidden flex flex-col gap-[5px] p-2 -ml-2 pointer-events-auto"
              onClick={() => setMenuOpen(true)}
            >
              <div className={`h-[2px] w-6 transition-colors duration-500 ${navBgClass}`} />
              <div className={`h-[2px] w-6 transition-colors duration-500 ${navBgClass}`} />
              <div className={`h-[2px] w-4 transition-colors duration-500 ${navBgClass}`} />
            </button>

            {/* Right Cluster */}
            <div 
              className="hidden sm:flex items-center gap-6"
              style={{
                opacity: 0,
                animation: `navEntrance 0.6s cubic-bezier(0.16,1,0.3,1) 500ms forwards`
              }}
            >
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity pointer-events-auto">
                <span className="text-xs tracking-[0.2em] uppercase font-medium">NEWS</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-500 ${navBgClass}`}>
                  <Info size={10} className={isLight ? 'text-dark' : 'text-white'} />
                </div>
              </div>
              <button 
                className="text-xs tracking-[0.2em] uppercase font-medium hover:opacity-70 transition-opacity lg:pointer-events-none pointer-events-auto"
                onClick={() => setMenuOpen(true)}
              >
                MENU
              </button>
            </div>
          </nav>

          {/* Section 1 */}
          <div 
            ref={s1Ref}
            className="absolute inset-0 px-6 sm:px-8 md:px-20 lg:px-32 flex flex-col justify-center"
            style={{ willChange: 'opacity', opacity: 1 }}
          >
            <Stagger visible={s1Vis} delay={0}>
              <h1 className="text-[clamp(2rem,5vw,5rem)] font-light uppercase leading-[1.2] text-dark max-w-4xl">
                Advancing resources for a cleaner future
              </h1>
            </Stagger>
            
            <Stagger visible={s1Vis} delay={150}>
              <p className="mt-6 text-sm tracking-[0.3em] uppercase text-[#1D304590]">
                Sustainable power with purpose
              </p>
            </Stagger>
            
            <Stagger visible={s1Vis} delay={300} className="absolute bottom-12 right-6 sm:right-8 md:right-12 pointer-events-auto">
              <button className="w-12 h-12 rounded-full border border-dark/50 flex items-center justify-center hover:opacity-70 transition-opacity">
                <ArrowRight size={18} className="text-dark" />
              </button>
            </Stagger>
          </div>

          {/* Section 2 */}
          <div 
            ref={s2Ref}
            className="absolute inset-0 px-6 sm:px-8 flex items-center justify-center"
            style={{ willChange: 'opacity', opacity: 0 }}
          >
            <Stagger visible={s2Vis} delay={0} className="max-w-[900px]">
              <h2 className="text-[clamp(1.5rem,4.5vw,4.5rem)] font-extralight tracking-wide leading-[1.3] text-center uppercase">
                We build lasting partnerships with vision <span className="text-dark/80">and precision</span> <span className="text-dark/50">across every frontier</span>
              </h2>
            </Stagger>

            <div className="absolute bottom-16 right-6 sm:right-8 md:right-12 flex flex-col items-center pointer-events-auto">
              <Stagger visible={s2Vis} delay={200}>
                <div className="w-12 h-12 rounded-full border border-dark/40 flex items-center justify-center">
                  <ArrowDown size={18} className="text-dark" />
                </div>
              </Stagger>
              
              <Stagger visible={s2Vis} delay={350} className="mt-4 flex flex-col gap-2">
                <div className="w-2 h-2 rounded-full bg-dark" />
                <div className="w-1.5 h-1.5 rounded-full bg-dark/40 mx-auto" />
                <div className="w-1.5 h-1.5 rounded-full bg-dark/40 mx-auto" />
              </Stagger>

              <Stagger visible={s2Vis} delay={500} className="mt-2">
                <div className="w-10 h-10 rounded-full border border-dark/30 flex items-center justify-center">
                  <ChevronUp size={16} className="text-dark/80" />
                </div>
              </Stagger>
            </div>
          </div>

          {/* Section 3 */}
          <div 
            ref={s3Ref}
            className="absolute inset-0 px-6 sm:px-8 md:px-20 lg:px-32 flex items-center justify-end"
            style={{ willChange: 'opacity', opacity: 0 }}
          >
            <div className="max-w-2xl text-left pointer-events-auto">
              <Stagger visible={s3Vis} delay={0}>
                <div className="text-white/60 text-lg tracking-wide mb-4">
                  Halder | Nordvik
                </div>
              </Stagger>
              
              <Stagger visible={s3Vis} delay={150}>
                <h2 className="text-[clamp(2rem,4vw,4rem)] font-light text-white leading-[1.2] uppercase tracking-wide mb-8 whitespace-pre-line">
                  {`Fueling ambition,\nshaping tomorrow.`}
                </h2>
              </Stagger>
              
              <Stagger visible={s3Vis} delay={300} className="flex items-center gap-4">
                <span className="text-sm tracking-[0.3em] text-white/80 uppercase">Contact Nordvik</span>
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform duration-300">
                  <ArrowRight size={16} className="text-gray-800" />
                </button>
              </Stagger>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[100] bg-dark transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        <div className={`absolute top-0 right-0 p-6 sm:p-8 pt-8 sm:pt-12 transition-transform duration-500 ${menuOpen ? 'translate-y-0' : '-translate-y-8'}`}>
          <button 
            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-white transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className={`flex flex-col justify-center h-full px-8 sm:px-12 transition-transform duration-500 ${menuOpen ? 'translate-y-0' : '-translate-y-8'}`}>
          {['VECTRUS ENERGY', 'VECTRUS UPSTREAM', 'VECTRUS MARKETS', 'VECTRUS SYSTEMS', 'VECTRUS+'].map((item, i) => (
            <a 
              key={item}
              href="#"
              className={`py-3 text-2xl sm:text-3xl font-light tracking-wide uppercase transition-all duration-300 ${i === 0 ? 'text-white' : 'text-white/60 hover:text-white'}`}
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.4s ease ${i * 60 + 100}ms`
              }}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="absolute bottom-10 left-0 w-full px-8 sm:px-12 flex gap-8">
          <a href="#" className="text-xs tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors">NEWS</a>
          <a href="#" className="text-xs tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors">CONTACT</a>
        </div>
      </div>

      <style>{`
        @keyframes navEntrance {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        body {
          ${menuOpen ? 'overflow: hidden;' : ''}
        }
      `}</style>
    </div>
  );
}
