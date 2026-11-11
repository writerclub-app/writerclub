import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import './PrivacyPage.css'

const LAST_UPDATED = '10 de novembro de 2026'
const CONTACT_EMAIL = 'contato@writerclub.app'

export function PrivacyPage() {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <Link to="/" className="privacy-header__logo">WriterClub</Link>
      </header>

      <main className="privacy-content">
        {isEn ? <EnContent /> : <PtContent />}
      </main>

      <footer className="privacy-footer">
        <Link to="/">← Voltar para o WriterClub</Link>
      </footer>
    </div>
  )
}

function PtContent() {
  return (
    <>
      <h1>Política de Privacidade</h1>
      <p className="privacy-updated">Última atualização: {LAST_UPDATED}</p>

      <p>
        O <strong>WriterClub</strong> (<em>writerclub.app</em>) é uma plataforma de escrita criativa.
        Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações.
      </p>

      <h2>1. Dados que coletamos</h2>
      <p>Coletamos apenas o mínimo necessário para o funcionamento do app:</p>
      <ul>
        <li><strong>Conta Google:</strong> nome de exibição e endereço de e-mail, usados exclusivamente para autenticação.</li>
        <li><strong>Escritas:</strong> textos, títulos e metadados que você cria dentro do app.</li>
        <li><strong>Preferências:</strong> configurações de tema, idioma e aparência, armazenadas localmente no seu dispositivo.</li>
      </ul>

      <h2>2. Como usamos seus dados</h2>
      <ul>
        <li>Autenticar você com segurança via Google OAuth 2.0.</li>
        <li>Exibir e sincronizar suas escritas entre dispositivos (quando você habilita o backup).</li>
        <li>Não usamos seus dados para publicidade, rastreamento ou venda a terceiros.</li>
      </ul>

      <h2>3. Armazenamento</h2>
      <p>
        Suas escritas são armazenadas <strong>localmente no seu dispositivo</strong> (IndexedDB).
        Opcionalmente, você pode habilitar o backup automático — disponível via <strong>GitHub Gist</strong> ou <strong>Google Drive</strong>.
        Nenhum dado é armazenado em servidores da WriterClub sem sua autorização explícita.
      </p>

      <h2>4. Integração com Google Drive</h2>
      <p>
        Se você optar pelo backup via Google Drive, o WriterClub solicita apenas o escopo <code>drive.file</code>,
        que permite ao app criar, ler e atualizar <strong>exclusivamente os arquivos que ele mesmo criou</strong>
        — uma pasta chamada <em>WriterClub</em> no seu Drive. O app não tem acesso a nenhum outro arquivo da sua conta Google Drive.
      </p>
      <p>
        O token de acesso ao Google Drive é armazenado apenas no seu dispositivo (localStorage) e nunca é enviado
        para servidores de terceiros.
      </p>

      <h2>5. Compartilhamento de dados</h2>
      <p>
        Não compartilhamos suas informações pessoais com terceiros, exceto:
      </p>
      <ul>
        <li><strong>Google:</strong> para autenticação via OAuth (sujeito à <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Política de Privacidade do Google</a>).</li>
        <li><strong>Cloudflare:</strong> infraestrutura de hospedagem da API (sujeito à <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Política de Privacidade da Cloudflare</a>).</li>
      </ul>

      <h2>6. Retenção e exclusão</h2>
      <p>
        Você pode excluir sua conta a qualquer momento dentro do app. Ao excluir, todos os seus dados
        armazenados em nossos servidores são removidos permanentemente. Dados locais no dispositivo
        devem ser limpos manualmente pelo usuário.
      </p>

      <h2>7. Segurança</h2>
      <p>
        Utilizamos HTTPS em todas as comunicações. Tokens de autenticação são armazenados localmente
        e nunca registrados em logs de servidor.
      </p>

      <h2>8. Menores de idade</h2>
      <p>
        O WriterClub não é direcionado a menores de 13 anos. Não coletamos conscientemente dados de crianças.
      </p>

      <h2>9. Alterações nesta política</h2>
      <p>
        Podemos atualizar esta política ocasionalmente. Notificaremos usuários sobre mudanças significativas
        por meio do app ou por e-mail.
      </p>

      <h2>10. Contato</h2>
      <p>
        Dúvidas sobre esta política? Entre em contato: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </>
  )
}

function EnContent() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="privacy-updated">Last updated: November 10, 2026</p>

      <p>
        <strong>WriterClub</strong> (<em>writerclub.app</em>) is a creative writing platform.
        This Privacy Policy describes how we collect, use, and protect your information.
      </p>

      <h2>1. Data we collect</h2>
      <p>We collect only the minimum necessary for the app to function:</p>
      <ul>
        <li><strong>Google account:</strong> display name and email address, used solely for authentication.</li>
        <li><strong>Writings:</strong> texts, titles, and metadata you create within the app.</li>
        <li><strong>Preferences:</strong> theme, language, and appearance settings, stored locally on your device.</li>
      </ul>

      <h2>2. How we use your data</h2>
      <ul>
        <li>To authenticate you securely via Google OAuth 2.0.</li>
        <li>To display and sync your writings across devices (when you enable backup).</li>
        <li>We do not use your data for advertising, tracking, or selling to third parties.</li>
      </ul>

      <h2>3. Storage</h2>
      <p>
        Your writings are stored <strong>locally on your device</strong> (IndexedDB).
        Optionally, you can enable automatic backup — available via <strong>GitHub Gist</strong> or <strong>Google Drive</strong>.
        No data is stored on WriterClub servers without your explicit authorization.
      </p>

      <h2>4. Google Drive integration</h2>
      <p>
        If you choose Google Drive backup, WriterClub requests only the <code>drive.file</code> scope,
        which allows the app to create, read, and update <strong>only the files it created itself</strong>
        — a folder named <em>WriterClub</em> in your Drive. The app has no access to any other files in your Google Drive account.
      </p>
      <p>
        The Google Drive access token is stored only on your device (localStorage) and is never sent to third-party servers.
      </p>

      <h2>5. Data sharing</h2>
      <p>We do not share your personal information with third parties, except:</p>
      <ul>
        <li><strong>Google:</strong> for OAuth authentication (subject to <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google's Privacy Policy</a>).</li>
        <li><strong>Cloudflare:</strong> API hosting infrastructure (subject to <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Cloudflare's Privacy Policy</a>).</li>
      </ul>

      <h2>6. Retention and deletion</h2>
      <p>
        You can delete your account at any time within the app. Upon deletion, all your data
        stored on our servers is permanently removed. Local device data must be cleared manually by the user.
      </p>

      <h2>7. Security</h2>
      <p>
        We use HTTPS for all communications. Authentication tokens are stored locally
        and are never logged on our servers.
      </p>

      <h2>8. Children</h2>
      <p>
        WriterClub is not directed at children under 13. We do not knowingly collect data from children.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this policy occasionally. We will notify users of significant changes
        through the app or by email.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about this policy? Contact us: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </>
  )
}
