/**
 * Iconos redes sociales – Facebook, Instagram, WhatsApp (PNG).
 * Ubicación: apps/web/src/components/SocialIcons.tsx
 */

import faceIcon from '../assets/images/FACE.png';
import instaIcon from '../assets/images/INSTA.png';
import whatsIcon from '../assets/images/WHATS.png';

const SOCIAL_LINKS = [
  { href: 'https://www.facebook.com/profile.php?id=61562829737223', label: 'Facebook', className: 'social-icon-fb', src: faceIcon },
  { href: 'https://www.instagram.com/ticketstransfer.01/?ref=xav_igxfb_comet_ig_bookmark_mega_menu_launch', label: 'Instagram', className: 'social-icon-ig', src: instaIcon },
  { href: 'https://wa.me/+5491176675436', label: 'WhatsApp', className: 'social-icon-wa', src: whatsIcon },
] as const;

export function SocialIcons() {
  return (
    <div className="social-icons" role="list">
      {SOCIAL_LINKS.map(({ href, label, className, src }) => (
        <a key={label} href={href} className={`social-icon ${className}`} aria-label={label}>
          <img src={src} alt="" aria-hidden className="social-icon-img" />
        </a>
      ))}
    </div>
  );
}
