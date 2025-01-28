'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import React from 'react'

// Define proper motion component types
type MotionDivProps = HTMLMotionProps<"div"> & {
  className?: string
  children?: React.ReactNode
}

const MotionDiv = motion.div as React.ComponentType<MotionDivProps>

export const PinContainer = ({
  children,
  title,
  href,
  className,
}: {
  children: React.ReactNode
  title?: string
  href?: string
  className?: string
}) => {
  return (
    <div
      className={`group/pin relative cursor-pointer ${className}`}>
      <div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-[#c7d2fe] to-[#8678f9] opacity-75 blur transition duration-1000 group-hover/pin:-inset-1 group-hover/pin:opacity-100 group-hover/pin:duration-150" />
      <MotionDiv
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.995 }}
        className="relative flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-r from-white to-white px-4 py-2 transition duration-200 hover:shadow-xl dark:from-zinc-900 dark:to-zinc-900"
      >
        {children}
      </MotionDiv>
    </div>
  )
}

export const Pin = () => {
  return (
    <div className="relative h-screen w-full">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <PinContainer>
          <div className="flex h-[25rem] w-[20rem] flex-col items-center justify-center rounded-lg bg-white p-4 dark:bg-zinc-900">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.5, x: "0px", y: "0px" }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: 1,
                z: 10,
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: 0,
              }}
              className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500"
            />
            <MotionDiv
              initial={{ opacity: 0, scale: 0.5, x: "0px", y: "0px" }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: 1,
                z: 10,
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: 2,
              }}
              className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500"
            />
            <MotionDiv
              initial={{ opacity: 0, scale: 0.5, x: "0px", y: "0px" }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: 1,
                z: 10,
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: 4,
              }}
              className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500"
            />
            <div className="flex flex-col items-center">
              <MotionDiv className="h-8 w-8 rounded-full bg-[#1d9bf0]" />
              <MotionDiv className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
              <MotionDiv className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
              <MotionDiv className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
              <MotionDiv className="h-1.5 w-1.5 rounded-full bg-[#1d9bf0]" />
            </div>
          </div>
        </PinContainer>
      </div>
    </div>
  )
}
