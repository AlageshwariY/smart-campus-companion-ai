import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  height?: string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  count = 3, 
  height = 'h-24',
  className = ''
}) => {
  return (
    <div className={`space-y-4 animate-fadeIn ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${height} rounded-2xl`}
          style={{ animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
};
