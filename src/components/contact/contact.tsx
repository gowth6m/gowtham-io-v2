import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

export default function Contact() {
  return (
    <section id="contact" className="flex flex-col">
      <h1 className="text-xl font-semibold text-[var(--lightest-slate)] md:hidden py-2 md:py-0">
        Contact
      </h1>
      <div className="">
        Give me a follow on my socials
        <br />
        or drop a message on{' '}
        <a
          href="https://www.linkedin.com/in/gowth6m/"
          target="_blank"
          className="text-[var(--green-bright)] group md:px-1"
        >
          LinkedIn
          <FontAwesomeIcon
            icon={faArrowRight}
            className="inline h-[16px] hover:text-[var(--green-bright)] px-2 translate-y-[3px] duration-150 group-hover:translate-x-1"
            size="xs"
          />
        </a>
      </div>
    </section>
  );
}
