import { Select } from '@awakr/awake-ui/select'
import { useLanguage, LANGUAGES } from '@/hooks/useLanguage'
import type { Language } from '@/hooks/useLanguage'

export function LanguageSelector() {
  const { language, change } = useLanguage()

  return (
    <Select.Root value={language} onValueChange={(val) => change(val as Language)}>
      <Select.Trigger>
        <Select.Value />
        <Select.Icon>▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              {LANGUAGES.map((lang) => (
                <Select.Item key={lang.value} value={lang.value}>
                  <Select.ItemIndicator>✓</Select.ItemIndicator>
                  <Select.ItemText>{lang.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
