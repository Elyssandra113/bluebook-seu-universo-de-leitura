export function SkipLink() {
  return (
    <a
      className="skip-link"
      href="#conteudo"
      onClick={(event) => {
        event.preventDefault();
        const main = document.getElementById('conteudo');
        main?.focus();
        main?.scrollIntoView({ block: 'start' });
      }}
    >
      Pular para o conteúdo
    </a>
  );
}
