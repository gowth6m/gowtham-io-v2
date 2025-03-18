"use client";

import {
    faCodepen,
    faGithub,
    faInstagram,
    faLinkedinIn,
    faTwitter as faX,
} from "@fortawesome/free-brands-svg-icons";
import TypingText from "./typingText";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import React, { RefObject, useEffect, useState, useMemo } from "react";

interface HeroProps {
    refAbout: RefObject<HTMLDivElement | null>;
    refExperience: RefObject<HTMLDivElement | null>;
    refProjects: RefObject<HTMLDivElement | null>;
    refContact: RefObject<HTMLDivElement | null>;
}

const Hero: React.FC<HeroProps> = React.memo(
    ({ refAbout, refExperience, refProjects, refContact }) => {
        const [activeSection, setActiveSection] = useState("about");

        const isAboutVisible = useIntersectionObserver(refAbout, {
            threshold: 0,
        });
        const isExperienceVisible = useIntersectionObserver(refExperience, {
            threshold: 0.5,
        });
        const isProjectsVisible = useIntersectionObserver(refProjects, {
            threshold: 0.5,
        });
        const isContactVisible = useIntersectionObserver(refContact, {
            threshold: 0.5,
        });

        useEffect(() => {
            if (isAboutVisible) setActiveSection("about");
            else if (isExperienceVisible) setActiveSection("experience");
            else if (isProjectsVisible) setActiveSection("projects");
            else if (isContactVisible) setActiveSection("contact");
        }, [
            isAboutVisible,
            isExperienceVisible,
            isProjectsVisible,
            isContactVisible,
        ]);

        const socials = useMemo(
            () => [
                {
                    name: "GitHub",
                    icon: faGithub,
                    href: "https://github.com/gowth6m",
                },
                {
                    name: "LinkedIn",
                    icon: faLinkedinIn,
                    href: "https://www.linkedin.com/in/gowth6m/",
                },
                {
                    name: "Instagram",
                    icon: faInstagram,
                    href: "https://www.instagram.com/gowth6m/",
                },
                {
                    name: "Twitter",
                    icon: faX,
                    href: "https://twitter.com/gowth6m",
                },
                {
                    name: "CodePen",
                    icon: faCodepen,
                    href: "https://codepen.io/Gowth6m",
                },
            ],
            []
        );

        const navItems = useMemo(
            () => [
                { name: "about", href: "#about" },
                { name: "experience", href: "#experience" },
                { name: "projects", href: "#projects" },
                { name: "contact", href: "#contact" },
            ],
            []
        );

        const containerVariants = useMemo(
            () => ({
                hidden: { opacity: 0, x: -100 },
                visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 10,
                        duration: 2,
                    },
                },
            }),
            []
        );

        const containerVariantsDelayed = useMemo(
            () => ({
                hidden: { opacity: 0, x: -100 },
                visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 10,
                        duration: 2,
                        delay: 0.2,
                    },
                },
            }),
            []
        );

        const itemVariants = useMemo(
            () => ({
                hidden: { opacity: 0, x: -100 },
                visible: (custom: number) => ({
                    opacity: 1,
                    x: 0,
                    transition: {
                        delay: custom * 0.1,
                        type: "spring",
                        stiffness: 100,
                        damping: 10,
                    },
                }),
            }),
            []
        );

        return (
            <motion.section
                id="home"
                className="flex flex-col md:justify-between mb-16 md:mb-0 h-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="flex flex-col md:gap-y-16">
                    {/* Name */}
                    <div className="flex flex-col gap-y-2">
                        <h1 className="text-4xl font-semibold text-[var(--lightest-slate)]">
                            Gowthaman Ravindrathas
                        </h1>
                        <h2 className="text-[var(--lightest-slate)]">
                            Full Stack Software Engineer
                        </h2>
                        <TypingText className="text-base mt-4" />
                    </div>

                    {/* Nav */}
                    <div className="md:flex flex-col gap-y-6 text-sm header-nav duration-300 hidden">
                        {navItems.map((item, index) => (
                            <motion.a
                                key={item.name}
                                href={item.href}
                                className={`hover:text-[var(--lightest-slate)] tracking-wider mr-auto ${
                                    activeSection === item.name
                                        ? "text-[var(--lightest-slate)] header-nav-current"
                                        : "text-[var(--dark-slate)]"
                                }`}
                                custom={index}
                                variants={itemVariants}
                            >
                                {item.name}
                            </motion.a>
                        ))}
                    </div>
                </div>

                {/* Socials */}
                <motion.div
                    className="flex flex-row gap-x-6 my-6 md:mb-0 md:mt-auto"
                    variants={containerVariantsDelayed}
                    initial="hidden"
                    animate="visible"
                >
                    {socials.map((social, index) => (
                        <motion.a
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            custom={index}
                            variants={itemVariants}
                        >
                            <FontAwesomeIcon
                                icon={social.icon}
                                className="h-[25px] hover:text-[var(--green-bright)] duration-300 hover:translate-y-[-4px]"
                            />
                        </motion.a>
                    ))}
                </motion.div>
            </motion.section>
        );
    }
);

Hero.displayName = "Hero";
export default Hero;
