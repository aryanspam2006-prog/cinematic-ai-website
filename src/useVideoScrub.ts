import { useEffect, RefObject, useRef } from 'react';

export function useVideoScrub(
  videoRef: RefObject<HTMLVideoElement>,
  trackRef: RefObject<HTMLElement>,
  onProgress: (p: number) => void
) {
  const isReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  
  const stateRef = useRef({
    current: 0,
    target: 0,
    lastTime: performance.now(),
    isSeeking: false,
    maxScroll: 0
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => {
      isReducedMotion.current = e.matches;
    };
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onSeeking = () => { stateRef.current.isSeeking = true; };
    const onSeeked = () => { stateRef.current.isSeeking = false; };
    
    // Call pause() on mount to ensure it's not playing
    video.pause();

    video.addEventListener('seeking', onSeeking);
    video.addEventListener('seeked', onSeeked);

    return () => {
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [videoRef]);

  useEffect(() => {
    const state = stateRef.current;
    
    const computeSpan = () => {
      if (trackRef.current) {
        state.maxScroll = Math.max(0, trackRef.current.offsetHeight - window.innerHeight);
      }
    };
    
    computeSpan();
    
    window.addEventListener('resize', computeSpan, { passive: true });
    window.addEventListener('orientationchange', computeSpan, { passive: true });

    let rafId: number;
    
    const loop = (time: number) => {
      const dt = Math.min(0.1, (time - state.lastTime) / 1000);
      state.lastTime = time;

      const scrollY = window.scrollY;
      let p = 0;
      if (state.maxScroll > 0) {
        p = Math.max(0, Math.min(1, scrollY / state.maxScroll));
      }
      
      state.target = p;
      
      if (isReducedMotion.current) {
        state.current = state.target;
      } else {
        state.current += (state.target - state.current) * (1 - Math.exp(-dt * 12));
        if (Math.abs(state.target - state.current) < 0.0004) {
          state.current = state.target;
        }
      }

      onProgress(state.current);

      const video = videoRef.current;
      if (video && video.duration) {
        const targetTime = state.current * video.duration;
        if (!state.isSeeking && Math.abs(video.currentTime - targetTime) > 1 / 60) {
          video.currentTime = targetTime;
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', computeSpan);
      window.removeEventListener('orientationchange', computeSpan);
      cancelAnimationFrame(rafId);
    };
  }, [videoRef, trackRef, onProgress]);
}
