"use client"

import { useState, useRef, useEffect } from "react"
import { User, Package, UserCircle } from "lucide-react"
import * as Button from "app/components/align-ui/ui/button"

interface UserProfileDropdownProps {
  onLoginClick?: () => void
  onOrdersClick?: () => void
  onProfileClick?: () => void
  className?: string
}

export default function ProfileDropdown({
  onLoginClick,
  onOrdersClick,
  onProfileClick,
  className = "",
}: UserProfileDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const closeDropdown = () => {
    setIsDropdownOpen(false)
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

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <div className={`relative ${className}`}>
      <div
        ref={profileButtonRef}
        onClick={toggleDropdown}
        className="p-2 text-gray-600 transition-colors rounded cursor-pointer"
        aria-label="Perfil do usuário"
        aria-expanded={isDropdownOpen}
      >
        <User className="w-5 h-5 text-text-sub-600 hover:text-text-strong-950 transition-colors" />
      </div>

      {/* Dropdown Overlay */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-50"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conta</h3>

          <div className="space-y-3">
            <Button.Root
              variant="error"
              mode="filled"
              size="medium"
              className="w-full"
              onClick={handleLoginClick}
            >
              Fazer login
            </Button.Root>

            <div className="flex space-x-3">
              <Button.Root
                variant="neutral"
                mode="stroke"
                className="flex-1 rounded-full py-3 border-gray-300 bg-transparent"
                onClick={handleOrdersClick}
              >
                <Package className="w-4 h-4 mr-2" />
                Pedidos
              </Button.Root>
              <Button.Root
                variant="neutral"
                mode="stroke"
                className="flex-1 rounded-full py-3 border-gray-300 bg-transparent"
                onClick={handleProfileClick}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Perfil
              </Button.Root>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 