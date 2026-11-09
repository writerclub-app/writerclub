import { Select } from '@awakr/awake-ui/select'
import { useLanguage, LANGUAGES } from '@/hooks/useLanguage'
import type { Language } from '@/hooks/useLanguage'
import './LanguageSelector.css'

export function LanguageSelector() {
  const { language, change } = useLanguage()

  const current = LANGUAGES.find((l) => l.value === language)

  return (
    <Select.Root value={language} onValueChange={(val) => change(val as Language)}>
      <Select.Trigger>
        <Select.Value>
          {current ? `${current.flag} ${current.value.toUpperCase()}` : language.toUpperCase()}
        </Select.Value>
        <Select.Icon>▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup className="lang-select-popup">
            <Select.List>
              {LANGUAGES.map((lang) => (
                <Select.Item key={lang.value} value={lang.value}>
                  <Select.ItemText>{lang.flag} {lang.label}</Select.ItemText>
                  <Select.ItemIndicator>✓</Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
