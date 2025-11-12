import React from 'react';
import { FileCode2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full text-center p-8 bg-neutral-bg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6 bg-secondary/10 rounded-full mb-6">
        <FileCode2 size={48} className="text-secondary" />
      </div>
      <h1 className="text-4xl font-bold text-neutral-text-primary mb-2">{title}</h1>
      <p className="text-lg text-neutral-text-secondary max-w-md">
        Esta área está em desenvolvimento. A funcionalidade completa para '{title}' será implementada em breve.
      </p>
    </motion.div>
  );
};

export default PlaceholderPage;
