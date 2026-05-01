'use client'

import { useEffect } from 'react'

export default function AnimateOnScroll() {
  useEffect(() => {
    const vh = window.innerHeight

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' },
    )

    // Stagger grids — observe ALL (IntersectionObserver fires immediately for in-viewport elements)
    document.querySelectorAll('.stagger-grid').forEach((grid) => {
      observer.observe(grid)
    })

    // Section headings — observe all
    document.querySelectorAll('.reveal-heading').forEach((el) => {
      observer.observe(el)
    })

    // Sections below the fold — add reveal class only if not already visible
    document.querySelectorAll('section:not(:first-child)').forEach((section) => {
      const rect = section.getBoundingClientRect()
      if (rect.top > vh * 0.5) {
        section.classList.add('reveal-section')
        observer.observe(section)
      }
    })

    return () => observer.disconnect()
  }, [])

  return null
}
