import { Building2 } from 'lucide-react';

export default function BrandLogo({ url, name, size = 'normal' }) {
  return (
    <div className={`brand-logo ${size === 'large' ? 'brand-logo--large' : ''}`}>
      {url ? <img alt={`Logo: ${name}`} src={url} /> : <Building2 size={size === 'large' ? 27 : 20} />}
    </div>
  );
}
