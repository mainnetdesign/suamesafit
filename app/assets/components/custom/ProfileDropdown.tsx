"use client"

import { useState, useRef, useEffect } from "react"
import { User, Package, UserCircle } from "lucide-react"
import * as Button from "app/components/align-ui/ui/button"
import { RiUser3Line } from "react-icons/ri"
import { useRouteLoaderData } from "@remix-run/react"

interface UserProfileDropdownProps {
  onLoginClick?: () => void
  onOrdersClick?: () => void
  onProfileClick?: () => void
  className?: string
  mobile?: boolean
}

export default function ProfileDropdown({
  onLoginClick,
  onOrdersClick,
  onProfileClick,
  className = "",
  mobile = false,
}: UserProfileDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(mobile)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLDivElement>(null)

  // Obter dados do loader root conforme documentação Shopify
  const rootData: any = useRouteLoaderData('root')

  const toggleDropdown = () => {
    if (!mobile) setIsDropdownOpen(!isDropdownOpen)
  }

  const closeDropdown = () => {
    if (!mobile) setIsDropdownOpen(false)
  }

  const handleLoginClick = () => {
    closeDropdown()
    onLoginClick?.()
  }

  const handleOrdersClick = () => {
    closeDropdown()
    onOrdersClick?.()
  }

  const handleProfileClick = () => {
    closeDropdown()
    onProfileClick?.()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        profileButtonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        closeDropdown()
      }
    }

    if (isDropdownOpen && !mobile) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      if (!mobile) document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  // Componente interno para renderizar o estado autenticado
  const AuthenticatedContent = ({ isLoggedIn, customerData }: { isLoggedIn: boolean, customerData: {id: string; firstName: string; lastName: string; emailAddress?: {emailAddress: string}} | null }) => {
    // Calcular inicial do email de forma segura
    const email = customerData?.emailAddress?.emailAddress;
    const initial = email && typeof email === 'string' && email.length > 0
      ? email.charAt(0).toUpperCase()
      : ""

    return (
      <>
        {!mobile && (
          <div
            ref={profileButtonRef}
            onClick={toggleDropdown}
            className="p-2 text-gray-600 transition-colors rounded cursor-pointer"
            aria-label="Perfil do usuário"
            aria-expanded={isDropdownOpen}
          >
            {isLoggedIn && initial ? (
              // Avatar circular com inicial quando logado
              <div className="w-8 h-8 bg-primary-base text-white rounded-full flex items-center justify-center text-sm font-medium">
                {initial}
              </div>
            ) : (
              // Ícone padrão quando não logado
              <RiUser3Line className="w-5 h-5 text-text-sub-600 hover:text-text-strong-950 transition-colors" />
            )}
          </div>
        )}

        {/* Dropdown Overlay */}
        {(isDropdownOpen || mobile) && (
          <div
            ref={dropdownRef}
            className={`${mobile ? 'relative mt-0 w-full p-0 border-none' : 'absolute right-0 top-full mt-2 z-50 w-80 p-6 border border-gray-200'} bg-yellow-50 rounded-lg shadow-lg`}
          >
            <h5 className="text-label-xl text-text-sub-600 mb-4">conta</h5>

            <div className="space-y-3">
              {isLoggedIn && customerData && email ? (
                // Mostrar email quando logado
                <div className="text-sm text-text-sub-600 rounded">
                  {email}
                </div>
              ) : (
                // Botão de login quando não logado
                <Button.Root
                  variant="primary"
                  mode="filled"
                  size="medium"
                  className="w-full"
                  onClick={handleLoginClick}
                >
                  fazer login
                </Button.Root>
              )}

              <div className="flex space-x-3">
                <Button.Root
                  variant="neutral"
                  mode="stroke"
                  className="flex-1 rounded-full py-3 border-gray-300"
                  onClick={handleOrdersClick}
                >
                  <Package className="w-4 h-4 mr-2" />
                  pedidos
                </Button.Root>
                <Button.Root
                  variant="neutral"
                  mode="stroke"
                  className="flex-1 rounded-full py-3 border-gray-300"
                  onClick={handleProfileClick}
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  perfil
                </Button.Root>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <AuthenticatedContent isLoggedIn={rootData?.isLoggedIn || false} customerData={rootData?.customerData || null} />
    </div>
  )
} 