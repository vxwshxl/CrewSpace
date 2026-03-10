'use client';

import React, { useEffect, useRef } from "react";
import "./landing.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Info, MonitorSmartphone } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Store DOM elements
    const animatedIcons = document.querySelector(".animated-icons");
    const iconElements = document.querySelectorAll(".animated-icon");
    const textSegments = document.querySelectorAll(".text-segment");
    const placeholders = document.querySelectorAll(".placeholder-icon");
    const heroHeader = document.querySelector(".hero-header");
    const heroSection = document.querySelector(".hero") as HTMLElement;

    // Track duplicates to clean them up properly between hot-reloads/strict mode
    // @ts-ignore
    window.duplicateIcons = window.duplicateIcons || null;

    if (!animatedIcons || iconElements.length === 0 || textSegments.length === 0 || !heroSection) {
      return;
    }

    const textAnimationOrder: { segment: Element; originalIndex: number }[] = [];
    textSegments.forEach((segment, index) => {
      textAnimationOrder.push({ segment, originalIndex: index });
    });

    // Shuffle array
    for (let i = textAnimationOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [textAnimationOrder[i], textAnimationOrder[j]] = [
        textAnimationOrder[j],
        textAnimationOrder[i],
      ];
    }

    const isMobile = window.innerWidth <= 1000;
    const headerIconSize = isMobile ? 30 : 60;
    const currentIconSize = iconElements[0].getBoundingClientRect().width;
    const exactScale = headerIconSize / currentIconSize;

    const scrollTrigger = ScrollTrigger.create({
      trigger: heroSection,
      start: "top top",
      end: `+=${window.innerHeight * 8}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        textSegments.forEach((segment) => {
          gsap.set(segment, { opacity: 0 });
        });

        if (progress <= 0.3) {
          const moveProgress = progress / 0.3;
          const containerMoveY = -window.innerHeight * 0.3 * moveProgress;

          if (progress <= 0.15) {
            const headerProgress = progress / 0.15;
            const headerMoveY = -50 * headerProgress;
            const headerOpacity = 1 - headerProgress;

            gsap.set(heroHeader, {
              transform: `translate(-50%, calc(-50% + ${headerMoveY}px))`,
              opacity: headerOpacity,
            });
          } else {
            gsap.set(heroHeader, {
              transform: `translate(-50%, calc(-50% + -50px))`,
              opacity: 0,
            });
          }

          // @ts-ignore
          if (window.duplicateIcons) {
              // @ts-ignore
            window.duplicateIcons.forEach((duplicate: any) => {
              if (duplicate.parentNode) {
                duplicate.parentNode.removeChild(duplicate);
              }
            });
            // @ts-ignore
            window.duplicateIcons = null;
          }

          gsap.set(animatedIcons, {
            x: 0,
            y: containerMoveY,
            scale: 1,
            opacity: 1,
          });

          iconElements.forEach((icon, index) => {
            const staggerDelay = index * 0.1;
            const iconStart = staggerDelay;
            const iconEnd = staggerDelay + 0.5;

            const iconProgress = gsap.utils.mapRange(
              iconStart,
              iconEnd,
              0,
              1,
              moveProgress
            );
            const clampedProgress = Math.max(0, Math.min(1, iconProgress));

            const startOffset = -containerMoveY;
            const individualY = startOffset * (1 - clampedProgress);

            gsap.set(icon, {
              x: 0,
              y: individualY,
            });
          });
        } else if (progress <= 0.6) {
          const scaleProgress = (progress - 0.3) / 0.3;

          gsap.set(heroHeader, {
            transform: `translate(-50%, calc(-50% + -50px))`,
            opacity: 0,
          });

          if (scaleProgress >= 0.5) {
            heroSection.style.backgroundColor = "#e3e3db";
          } else {
            heroSection.style.backgroundColor = "#141414";
          }

          // @ts-ignore
          if (window.duplicateIcons) {
              // @ts-ignore
            window.duplicateIcons.forEach((duplicate: any) => {
              if (duplicate.parentNode) {
                duplicate.parentNode.removeChild(duplicate);
              }
            });
            // @ts-ignore
            window.duplicateIcons = null;
          }

          const targetCenterY = window.innerHeight / 2;
          const targetCenterX = window.innerWidth / 2;
          const containerRect = animatedIcons.getBoundingClientRect();
          const currentCenterX = containerRect.left + containerRect.width / 2;
          const currentCenterY = containerRect.top + containerRect.height / 2;
          const deltaX = (targetCenterX - currentCenterX) * scaleProgress;
          const deltaY = (targetCenterY - currentCenterY) * scaleProgress;
          const baseY = -window.innerHeight * 0.3;
          const currentScale = 1 + (exactScale - 1) * scaleProgress;

          gsap.set(animatedIcons, {
            x: deltaX,
            y: baseY + deltaY,
            scale: currentScale,
            opacity: 1,
          });

          iconElements.forEach((icon) => {
            gsap.set(icon, { x: 0, y: 0 });
          });
        } else if (progress <= 0.75) {
          const moveProgress = (progress - 0.6) / 0.15;

          gsap.set(heroHeader, {
            transform: `translate(-50%, calc(-50% + -50px))`,
            opacity: 0,
          });

          heroSection.style.backgroundColor = "#e3e3db";

          const targetCenterY = window.innerHeight / 2;
          const targetCenterX = window.innerWidth / 2;
          const containerRect = animatedIcons.getBoundingClientRect();
          const currentCenterX = containerRect.left + containerRect.width / 2;
          const currentCenterY = containerRect.top + containerRect.height / 2;
          const deltaX = targetCenterX - currentCenterX;
          const deltaY = targetCenterY - currentCenterY;
          const baseY = -window.innerHeight * 0.3;

          gsap.set(animatedIcons, {
            x: deltaX,
            y: baseY + deltaY,
            scale: exactScale,
            opacity: 0,
          });

          iconElements.forEach((icon) => {
            gsap.set(icon, { x: 0, y: 0 });
          });

          // @ts-ignore
          if (!window.duplicateIcons) {
              // @ts-ignore
            window.duplicateIcons = [];

            iconElements.forEach((icon, index) => {
              const duplicate = icon.cloneNode(true) as HTMLElement;
              duplicate.className = "duplicate-icon";
              duplicate.style.position = "absolute";
              duplicate.style.width = headerIconSize + "px";
              duplicate.style.height = headerIconSize + "px";

              document.body.appendChild(duplicate);
              // @ts-ignore
              window.duplicateIcons.push(duplicate);
            });
          }

          // @ts-ignore
          if (window.duplicateIcons) {
              // @ts-ignore
            window.duplicateIcons.forEach((duplicate: any, index: number) => {
              if (index < placeholders.length) {
                const iconRect = iconElements[index].getBoundingClientRect();
                const startCenterX = iconRect.left + iconRect.width / 2;
                const startCenterY = iconRect.top + iconRect.height / 2;
                const startPageX = startCenterX + window.pageXOffset;
                const startPageY = startCenterY + window.pageYOffset;

                const targetRect = placeholders[index].getBoundingClientRect();
                const targetCenterX = targetRect.left + targetRect.width / 2;
                const targetCenterY = targetRect.top + targetRect.height / 2;
                const targetPageX = targetCenterX + window.pageXOffset;
                const targetPageY = targetCenterY + window.pageYOffset;

                const moveX = targetPageX - startPageX;
                const moveY = targetPageY - startPageY;

                let currentX = 0;
                let currentY = 0;

                if (moveProgress <= 0.5) {
                  const verticalProgress = moveProgress / 0.5;
                  currentY = moveY * verticalProgress;
                } else {
                  const horizontalProgress = (moveProgress - 0.5) / 0.5;
                  currentY = moveY;
                  currentX = moveX * horizontalProgress;
                }

                const finalPageX = startPageX + currentX;
                const finalPageY = startPageY + currentY;

                duplicate.style.left = finalPageX - headerIconSize / 2 + "px";
                duplicate.style.top = finalPageY - headerIconSize / 2 + "px";
                duplicate.style.opacity = "1";
                duplicate.style.display = "flex";
                duplicate.style.zIndex = "50";
              }
            });
          }
        } else {
          gsap.set(heroHeader, {
            transform: `translate(-50%, calc(-50% + -100px))`,
            opacity: 0,
          });

          heroSection.style.backgroundColor = "#e3e3db";

          gsap.set(animatedIcons, { opacity: 0 });

          // @ts-ignore
          if (window.duplicateIcons) {
              // @ts-ignore
            window.duplicateIcons.forEach((duplicate: any, index: number) => {
              if (index < placeholders.length) {
                const targetRect = placeholders[index].getBoundingClientRect();
                const targetCenterX = targetRect.left + targetRect.width / 2;
                const targetCenterY = targetRect.top + targetRect.height / 2;
                const targetPageX = targetCenterX + window.pageXOffset;
                const targetPageY = targetCenterY + window.pageYOffset;

                duplicate.style.left = targetPageX - headerIconSize / 2 + "px";
                duplicate.style.top = targetPageY - headerIconSize / 2 + "px";
                duplicate.style.opacity = "1";
                duplicate.style.display = "flex";
                duplicate.style.zIndex = "50";
              }
            });
          }

          textAnimationOrder.forEach((item, randomIndex) => {
            const segmentStart = 0.75 + randomIndex * 0.03;
            const segmentEnd = segmentStart + 0.015;

            const segmentProgress = gsap.utils.mapRange(
              segmentStart,
              segmentEnd,
              0,
              1,
              progress
            );
            const clampedProgress = Math.max(0, Math.min(1, segmentProgress));

            gsap.set(item.segment, {
              opacity: clampedProgress,
            });
          });
        }
      },
    });

    return () => {
      scrollTrigger.kill();
      // @ts-ignore
      if (window.duplicateIcons) {
          // @ts-ignore
        window.duplicateIcons.forEach((duplicate: any) => {
          if (duplicate.parentNode) {
            duplicate.parentNode.removeChild(duplicate);
          }
        });
        // @ts-ignore
        window.duplicateIcons = null;
      }
      lenis.destroy();
    };
  }, []);

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="landing-page w-full overflow-hidden min-h-screen">
      <header className="navbar">
        <div className="nav-left">
          <Image src="/logoCS.png" className="logo" alt="CrewSpace logo" width={36} height={36} />
          <span className="brand-name font-bold">CrewSpace</span>
        </div>
        <div className="nav-right">
          <div className="desktop-nav">
            <div className="signup" onClick={goToDashboard}>
              <svg
                className="account-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Sign up</span>
            </div>
            <button className="btn-primary" onClick={goToDashboard}>Get Started</button>
          </div>
          <div className="mobile-nav">
            <MonitorSmartphone />
            <Info />
          </div>
        </div>
      </header>

      <section className="hero" ref={heroRef} style={{ color: "#e3e3db" }}>
        <div className="hero-header">
          <h1>CrewSpace</h1>
          <p>Personal Autonomous AI Agent Workforce</p>
        </div>

        <div className="animated-icons">
          <div className="animated-icon icon-1">
            <Image src="/icon_1.png" alt="" width={100} height={100} />
          </div>
          <div className="animated-icon icon-2">
            <Image src="/icon_2.png" alt="" width={100} height={100} />
          </div>
          <div className="animated-icon icon-3">
            <Image src="/icon_3.png" alt="" width={100} height={100} />
          </div>
          <div className="animated-icon icon-4">
            <Image src="/icon_4.png" alt="" width={100} height={100} />
          </div>
          <div className="animated-icon icon-5">
            <Image src="/icon_5.png" alt="" width={100} height={100} />
          </div>
        </div>

        <h1 className="animated-text">
          <div className="placeholder-icon"></div>
          <span className="text-segment">Build your AI crew</span>
          <div className="placeholder-icon"></div>
          <span className="text-segment">without writing code.</span>{" "}
          <span className="text-segment">Deploy smart agents</span>
          <div className="placeholder-icon"></div>
          <span className="text-segment">that work together</span>
          <div className="placeholder-icon"></div>
          <span className="text-segment">to accomplish any task</span>
          <div className="placeholder-icon"></div>
          <span className="text-segment">autonomously for you.</span>
        </h1>
      </section>

      <section className="outro">
        <h1>by Team Commit&Run</h1>
      </section>
    </div>
  );
}
