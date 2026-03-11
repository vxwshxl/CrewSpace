'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { createClient } from '@/utils/supabase/client';

const steps = [
  {
    title: 'Welcome!',
    message: "Let's dive into a tutorial on how to collaborate with your crew workflow. Shall we?",
    isIntro: true,
    placement: 'center'
  },
  {
    title: 'Step 1: Create a Flow',
    message: "First, let's create a new project. Click the 'Add New' button (or click Next to automatically create one) to begin building your Amazon Agent.",
    targetId: 'tutorial-create-new-btn',
    placement: 'bottom-left'
  },
  {
    title: 'Step 2: Open Node Panel',
    message: "Awesome! You are now in the Flow workspace. Click on 'Add Nodes' above to open your tools.",
    targetId: 'tutorial-add-nodes-btn',
    placement: 'bottom-left',
    hideOverlay: false
  },
  {
    title: 'Step 3: Start Node',
    message: "In the panel, grab the 'Start' node and drag it anywhere onto your canvas.",
    targetId: 'tutorial-node-start',
    placement: 'right',
    hideOverlay: true, // Allow interaction
  },
  {
    title: 'Step 4: Agent Node',
    message: "Now, drag an 'Agent' node and drop it next to the Start node.",
    targetId: 'tutorial-node-agent',
    placement: 'right',
    hideOverlay: true,
  },
  {
    title: 'Step 5: Connect Them',
    message: "Connect them by clicking and dragging from the small circle on the Start node to the Agent node.",
    placement: 'center',
    hideOverlay: true,
  },
  {
    title: 'Step 6: Configure',
    message: "Click the Agent node you just placed on the canvas to open its configuration panel.",
    placement: 'center',
    hideOverlay: true,
  },
  {
    title: 'Step 7: Give Instructions',
    message: "Type 'Buy a MacBook on Amazon.in' in the instructions text area here! Happy building!",
    targetId: 'tutorial-config-panel',
    placement: 'center-left',
    hideOverlay: false,
    isLast: true,
  }
];

export default function BubbleTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const addChatflow = useStore((state) => state.addChatflow);
  const supabase = createClient();

  useEffect(() => {
    // Check if the user has seen the tutorial in their app_metadata
    const checkTutorialState = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (!user.user_metadata?.tutorial_seen) {
          setIsVisible(true);
        }
      }
    };
    checkTutorialState();
  }, []);

  // Separate effect: catches force-start flag from the Tutorials page button
  // Runs on every pathname change so it works even when already mounted at /dashboard
  useEffect(() => {
    if (localStorage.getItem('tutorial_force_start') === 'true') {
      localStorage.removeItem('tutorial_force_start');
      setCurrentStep(0);
      setIsVisible(true);
    }
  }, [pathname]);

  // Auto advance tracking when route changes
  const [lastPath, setLastPath] = useState(pathname);

  useEffect(() => {
    if (lastPath === '/dashboard' && pathname.includes('/flow/') && currentStep === 1) {
        setCurrentStep(2); // Auto advance to Step 2
    }
    setLastPath(pathname);
  }, [pathname, currentStep, lastPath]);

  useEffect(() => {
    const updateRect = () => {
        const step = steps[currentStep];
        if (step.targetId) {
            const el = document.getElementById(step.targetId);
            if (el) {
                setTargetRect(el.getBoundingClientRect());
            } else {
                setTargetRect(null);
            }
        } else {
            setTargetRect(null);
        }
        setIsReady(true);
    };
    
    // Slight delay on mount to ensure DOM layout is painted before checking offsets
    const initialTimer = setTimeout(updateRect, 100);
    const interval = setInterval(updateRect, 300);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect, true);
    };
  }, [currentStep, pathname]);

  const handleClose = async () => {
    setIsVisible(false);
    // Mark tutorial as seen in Supabase so it never shows up again.
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.auth.updateUser({
            data: { tutorial_seen: true }
        });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1 && pathname === '/dashboard') {
       const tutorialFlowId = `flow-tutorial-${Date.now()}`;
       
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
           await supabase.from('chatflows').insert({
               id: tutorialFlowId,
               user_id: user.id,
               name: 'Amazon Order Agent',
               data: { nodes: [], edges: [] }
           });
       }

       router.push(`/flow/${tutorialFlowId}`);
       return; // useEffect will handle advancing currentStep on page load
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleClose();
    }
  };

  if (!isVisible || pathname === '/' || !isReady) return null;

  const step = steps[currentStep];

  // Calculate position logic
  let bubbleStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 100,
      opacity: isReady ? 1 : 0,
      transition: isReady ? 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
  };
  
  if (!isReady) {
       // Prevents rendering bounce
       bubbleStyle.top = '50%';
       bubbleStyle.left = '50%';
       bubbleStyle.transform = 'translate(-50%, -50%)';
  } else if (step.placement === 'center' || !targetRect) {
      bubbleStyle = {
          ...bubbleStyle,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: isReady ? 1 : 0, // Wait until coordinates are parsed to reveal
          transition: isReady ? 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
      };
  } else if (step.placement === 'bottom-left') {
      let safeLeft = targetRect.left;
      if (safeLeft + 320 > window.innerWidth - 16) {
          safeLeft = window.innerWidth - 320 - 16;
      }

      bubbleStyle = {
          ...bubbleStyle,
          top: targetRect.bottom + 16,
          left: Math.max(16, safeLeft), 
      };
      
      // Ensure we don't go off screen at bottom
      if (targetRect.bottom + 16 + 250 > window.innerHeight) {
          bubbleStyle.top = targetRect.top - 16;
          bubbleStyle.transform = 'translateY(-100%)';
      }
  } else if (step.placement === 'center-left') {
      bubbleStyle = {
          ...bubbleStyle,
          top: '50%',
          right: window.innerWidth - targetRect.left + 16,
          transform: 'translateY(-50%)',
      };
  } else if (step.placement === 'right') {
      bubbleStyle = {
          ...bubbleStyle,
          top: targetRect.top,
          left: targetRect.right + 16,
      };
  }

  // Clip path polygon to punch a hole for the target element
  const overlayStyle: React.CSSProperties = {
    backgroundColor: step.hideOverlay ? 'transparent' : 'rgba(0,0,0,0.6)',
    backdropFilter: step.hideOverlay ? 'none' : 'blur(4px)',
    pointerEvents: 'none', // Allow passing clicks through strictly to items
  };

  if (targetRect && !step.hideOverlay) {
      const p = 8; // padding around element
      const x = Math.max(0, targetRect.left - p);
      const y = Math.max(0, targetRect.top - p);
      const w = targetRect.width + p * 2;
      const h = targetRect.height + p * 2;
      
      // Draw outer bounds then punch inside hole
      overlayStyle.clipPath = `polygon(0% 0%, 0% 100%, ${x}px 100%, ${x}px ${y}px, ${x+w}px ${y}px, ${x+w}px ${y+h}px, ${x}px ${y+h}px, ${x}px 100%, 100% 100%, 100% 0%)`;
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-[99] transition-all duration-300"
        style={overlayStyle}
      />
      
      <div 
        className="max-w-[320px] animate-fade-in-up transition-all duration-300 ease-out"
        style={bubbleStyle}
      >
        <div className="bg-black/90 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/10 rounded-2xl p-5 relative">
          <button 
            onClick={handleClose}
            className="absolute top-3 right-3 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h3 className="font-semibold text-white mb-2 pr-6">
            {step.title}
          </h3>
          <p className="text-sm text-foreground/90 leading-relaxed mb-5">
            {step.message}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {!step.isIntro && steps.slice(1).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentStep - 1 ? 'bg-primary' : 'bg-white/20'}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step.isIntro ? (
                <>
                  <Button variant="ghost" size="sm" onClick={handleClose} className="text-xs text-muted-foreground hover:text-white">
                    No, thanks!
                  </Button>
                  <Button size="sm" onClick={handleNext} className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-full px-4">
                    Sure! <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  {currentStep > 0 && (
                    <Button variant="ghost" size="icon" onClick={handlePrev} className="h-7 w-7 rounded-full text-muted-foreground hover:text-white hover:bg-white/10">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  )}
                  {step.isLast ? (
                    <Button size="sm" onClick={handleNext} className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-full px-4">
                      Finish <Check className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleNext} className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-full px-4">
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
