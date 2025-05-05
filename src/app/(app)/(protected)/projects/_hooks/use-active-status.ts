import { parseAsBoolean, useQueryState } from 'nuqs'

const useActiveStatus = () => {
  const [active, setActive] = useQueryState('active', parseAsBoolean.withDefault(true))

  return { active, setActive }
}

export default useActiveStatus
