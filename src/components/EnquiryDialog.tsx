import { useState, type FormEvent } from 'react'
import { UNIT_TYPES } from '../data/inventory'
import { usePersistentState } from '../hooks/usePersistentState'
import { emptyEnquiry, isDirty, validateEnquiry, type EnquiryErrors, type EnquiryValues } from '../lib/validation'
import { ConfirmDialog, Dialog } from './Dialog'

interface Props {
  initialUnitType?: string
  onClose: () => void
}

interface SavedEnquiry extends EnquiryValues {
  savedAt: string
}

/**
 * Demo enquiry form. Nothing is sent anywhere: a valid submission is stored in this browser's
 * localStorage only, and the confirmation says exactly that.
 */
export function EnquiryDialog({ initialUnitType = '', onClose }: Props) {
  const [values, setValues] = useState<EnquiryValues>({ ...emptyEnquiry, unitType: initialUnitType })
  const [errors, setErrors] = useState<EnquiryErrors>({})
  const [saved, setSaved] = useState(false)
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)
  const [, setStored] = usePersistentState<SavedEnquiry[]>('greenz.demo.enquiries', [])

  const requestClose = () => {
    if (!saved && isDirty({ ...values, unitType: values.unitType === initialUnitType ? '' : values.unitType })) {
      setConfirmingDiscard(true)
    } else {
      onClose()
    }
  }

  const update = (key: keyof EnquiryValues) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const found = validateEnquiry(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setStored((prev) => [...prev, { ...values, savedAt: new Date().toISOString() }])
    setSaved(true)
  }

  if (confirmingDiscard) {
    return (
      <ConfirmDialog
        title="Discard enquiry?"
        message="You have unsent details in this form. Closing it will discard them."
        confirmLabel="Discard"
        onConfirm={onClose}
        onCancel={() => setConfirmingDiscard(false)}
      />
    )
  }

  if (saved) {
    return (
      <Dialog
        title="Saved on this device"
        onClose={onClose}
        actions={
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Done
          </button>
        }
      >
        <p>
          This is a demo: your details were saved in this browser only. No message was sent to Danube Properties. To
          enquire for real, call +971 800 57 57.
        </p>
      </Dialog>
    )
  }

  const field = (key: keyof EnquiryValues, label: string, input: React.ReactNode) => (
    <label className="field">
      <span>{label}</span>
      {input}
      {errors[key] && (
        <span className="field__error" role="alert">
          {errors[key]}
        </span>
      )}
    </label>
  )

  return (
    <Dialog
      title="Enquire now"
      onClose={requestClose}
      actions={
        <>
          <button type="button" className="btn btn--ghost" onClick={requestClose}>
            Cancel
          </button>
          <button type="submit" form="enquiry-form" className="btn btn--primary">
            Save enquiry
          </button>
        </>
      }
    >
      <form id="enquiry-form" className="form" onSubmit={submit} noValidate>
        {field('name', 'Full name', <input value={values.name} onChange={update('name')} autoComplete="name" aria-invalid={!!errors.name} />)}
        {field('email', 'Email', <input type="email" value={values.email} onChange={update('email')} autoComplete="email" aria-invalid={!!errors.email} />)}
        {field('phone', 'Phone', <input type="tel" value={values.phone} onChange={update('phone')} autoComplete="tel" aria-invalid={!!errors.phone} />)}
        {field(
          'unitType',
          'Unit type',
          <select value={values.unitType} onChange={update('unitType')} aria-invalid={!!errors.unitType}>
            <option value="">Select…</option>
            {UNIT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>,
        )}
        {field('message', 'Message (optional)', <textarea rows={3} value={values.message} onChange={update('message')} aria-invalid={!!errors.message} />)}
      </form>
    </Dialog>
  )
}
