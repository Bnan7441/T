import React from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
}

const OptimizedImage: React.FC<Props> = ({ src, alt = '', className = '', loading = 'lazy', decoding = 'async', ...rest }) => {
  return <img src={src} alt={alt} className={className} loading={loading} decoding={decoding} {...rest} />;
};

export default React.memo(OptimizedImage);
