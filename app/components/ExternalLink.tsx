import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type ExternalLinkProps = {
  href: string;
  text: string | number | null | undefined;
};

export default function ExternalLink({ href, text }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        textDecoration: 'underline',
        color: '#0000EE',
      }}
    >
      {text || ''}
      <OpenInNewIcon fontSize="small" sx={{ opacity: 0.6 }} />
    </a>
  );
}
