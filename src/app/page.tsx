"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="min-h-[90vh] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center px-6">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl py-20"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl font-extrabold mb-6"
        >
          Build a{" "}
          <span className="text-blue-600 dark:text-blue-400">
            Professional Resume
          </span>{" "}
          Effortlessly
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg text-gray-600 dark:text-gray-300 mb-10"
        >
          Enter your details, choose a design, and instantly get LaTeX code ready to paste into Overleaf.
          Fast, smart, and beautifully formatted — powered by AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            href="/home"
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200"
          >
            Get Started
          </Link>
          <Link
            href="/templates"
            className="px-8 py-3 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200"
          >
            Browse Templates
          </Link>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.2 }}
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: { opacity: 1, y: 0 },
        }}
        className="grid sm:grid-cols-3 gap-8 mt-10 max-w-5xl text-center"
      >
        {[
          {
            title: "AI-Powered",
            text: "Automatically generates perfectly formatted resume content using AI.",
          },
          {
            title: "Customizable Templates",
            text: "Choose from modern LaTeX templates that fit your style and profession.",
          },
          {
            title: "Export to Overleaf",
            text: "Instantly copy LaTeX code to Overleaf for easy editing and sharing.",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{feature.text}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-20 text-gray-500 dark:text-gray-400 text-sm"
      >
        © {new Date().getFullYear()} AI Resume Builder — All rights reserved.
      </motion.footer>
    </main>
  );
}
