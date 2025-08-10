import { Notify } from 'quasar'
import confetti from 'canvas-confetti'
import { useI18n } from 'vue-i18n'

const useHelpers = () => {
  const { t: $t } = useI18n()
  function sortNum(numArray) {
    return numArray.sort((a, b) => a - b);
  }

  function getCountSize(size, sizes) {
    let count = 0
    sizes.forEach(s => {
      if (s.size === size) {
        count += 1
      }
    });
    return count
  }

  function showSuccess(message, withConfetti = true) {
    Notify.create({
      color: 'primary',
      textColor: 'white',
      icon: 'mdi-check',
      message,
      position: 'bottom',
      timeout: 4000000,
      progress: true,
      actions: [
        {
          icon: 'close',
          color: 'white',
        }
      ]
    })
    if (withConfetti) {
      confetti({
        origin: { y: 1 },
        zIndex: 9999
      })
    }
  }

  function showError(message) {
    Notify.create({
      color: 'red-4',
      textColor: 'white',
      icon: 'mdi-alert',
      message,
      position: 'bottom',
      timeout: 4000,
      progress: true,
      actions: [
        {
          icon: 'close',
          color: 'white',
        }
      ]
    })
  }

  function isValidEmail(val) {
    const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    return emailPattern.test(val) || $t('validation.emailInvalid')
  }

  function difference(a, b) {
    return [...b.reduce( (acc, v) => acc.set(v, (acc.get(v) || 0) - 1),
            a.reduce( (acc, v) => acc.set(v, (acc.get(v) || 0) + 1), new Map() ) 
    )].reduce( (acc, [v, count]) => acc.concat(Array(Math.abs(count)).fill(v)), [] );
  }

  return {
    sortNum,
    getCountSize,
    showSuccess,
    showError,
    isValidEmail,
    difference,
  }
}

export default useHelpers;
