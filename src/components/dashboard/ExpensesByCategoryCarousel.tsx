import { useMemo, useRef, useState, useEffect, type MouseEvent } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

const donutColors = [
  'var(--color-sidebar-active)', // lime
  'var(--color-text-primary)', // preto
  'var(--gray-500)', // cinza médio
  'var(--gray-400)', // cinza claro
]

interface DonutProps {
  percent: number
  color: string
}

function Donut({ percent, color }: DonutProps) {
  const size = 64
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dash = Math.min(Math.max(percent, 0), 100) * (circumference / 100)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--gray-200)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-text-primary">
        {percent.toFixed(1)}%
      </div>
    </div>
  )
}

interface CategoryDonutCardProps {
  name: string
  amount: number
  percent: number
  color: string
}

function CategoryDonutCard({ name, amount, percent, color }: CategoryDonutCardProps) {
  return (
    <div
      className="
        w-[160px] min-w-[160px]
        rounded-xl border border-border bg-white
        p-6 shadow-sm
        flex flex-col items-center gap-4
        transition-colors duration-200
        hover:border-sidebar-active
      "
    >
      <Donut percent={percent} color={color} />
      <div className="text-sm text-text-primary text-center truncate w-full">{name}</div>
      <div className="text-lg font-semibold text-text-primary text-center">{formatCurrency(amount)}</div>
    </div>
  )
}

export function ExpensesByCategoryCarousel() {
  const { calculateExpensesByCategory, calculateCategoryPercentage } = useFinance()
  const list = calculateExpensesByCategory()
  const percentages = useMemo(() => calculateCategoryPercentage(), [calculateCategoryPercentage])
  const percentMap = useMemo(() => {
    const map: Record<string, number> = {}
    percentages.forEach((item) => {
      map[item.category] = item.percentage || 0
    })
    return map
  }, [percentages])

  const containerRef = useRef<HTMLDivElement>(null)
  const [isHover, setIsHover] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const dragStart = useRef<{ x: number; scrollLeft: number }>({ x: 0, scrollLeft: 0 })

  const updateScrollState = () => {
    const el = containerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (!el) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('scroll', updateScrollState)
    updateScrollState()

    const onResize = () => updateScrollState()
    window.addEventListener('resize', onResize)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX, scrollLeft: containerRef.current.scrollLeft }
  }

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return
    const delta = e.clientX - dragStart.current.x
    containerRef.current.scrollLeft = dragStart.current.scrollLeft - delta
  }

  const endDrag = () => {
    setIsDragging(false)
    updateScrollState()
  }

  const scrollByAmount = (delta: number) => {
    containerRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  const maskStyle = useMemo(() => {
    // Ajusta fade apenas quando há scroll disponível na direção
    if (canScrollLeft && canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)',
      }
    }
    if (canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, black 0%, black 80%, transparent 100%)',
        maskImage: 'linear-gradient(to right, black 0%, black 80%, transparent 100%)',
      }
    }
    if (canScrollLeft) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 100%)',
      }
    }
    return {
      WebkitMaskImage: 'linear-gradient(to right, black 0%, black 100%)',
      maskImage: 'linear-gradient(to right, black 0%, black 100%)',
    }
  }, [canScrollLeft, canScrollRight])

  if (!list.length) return null

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => {
        setIsHover(false)
        endDrag()
      }}
    >
      <div
        ref={containerRef}
        className="
          flex gap-4 overflow-x-auto overflow-y-visible pb-2
          cursor-grab active:cursor-grabbing
          no-scrollbar
        "
        style={maskStyle}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        {list.map((item, index) => {
          const color = donutColors[index % donutColors.length]
          const percent = percentMap[item.category] ?? 0
          return (
            <CategoryDonutCard
              key={item.category}
              name={item.category}
              amount={item.total}
              percent={percent}
              color={color}
            />
          )
        })}
      </div>

      {isHover && (
        <>
          <button
            type="button"
            className="
              hidden lg:flex
              absolute left-2 top-1/2 -translate-y-1/2
              w-10 h-10 rounded-full bg-white shadow-md border border-border
              items-center justify-center
            "
            onClick={() => scrollByAmount(-200)}
            aria-label="Voltar categorias"
          >
            <Icon name="chevronLeft" className="w-6 h-6 text-text-primary" />
          </button>
          <button
            type="button"
            className="
              hidden lg:flex
              absolute right-2 top-1/2 -translate-y-1/2
              w-10 h-10 rounded-full bg-white shadow-md border border-border
              items-center justify-center
            "
            onClick={() => scrollByAmount(200)}
            aria-label="Avançar categorias"
          >
            <Icon name="chevronRight" className="w-6 h-6 text-text-primary" />
          </button>
        </>
      )}
    </div>
  )
}
