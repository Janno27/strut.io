"use client"

import { User, UserCheck } from "lucide-react"

interface DefaultAvatarProps {
  gender: "male" | "female"
  name: string
  className?: string
}

export function DefaultAvatar({ gender, name, className = "" }: DefaultAvatarProps) {
  // Générer une couleur basée sur le nom pour avoir toujours la même couleur pour la même personne
  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      'from-blue-200 to-blue-300',
      'from-purple-200 to-purple-300', 
      'from-pink-200 to-pink-300',
      'from-green-200 to-green-300',
      'from-yellow-200 to-orange-200',
      'from-indigo-200 to-indigo-300',
      'from-red-200 to-red-300',
      'from-teal-200 to-teal-300',
      'from-cyan-200 to-cyan-300',
      'from-emerald-200 to-emerald-300'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }

  const gradientColor = getColorFromName(name);
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${gradientColor} flex flex-col items-center justify-center ${className}`}>
      {/* Logo en haut */}
      <div className="absolute top-3 left-3 text-gray-600">
        <UserCheck className="h-5 w-5" />
      </div>
      
      {/* Icône genre */}
      <div className="text-gray-600 mb-2">
        <User className="h-12 w-12" />
      </div>
      
      {/* Initiales */}
      <div className="text-gray-700 font-bold text-xl">
        {initials}
      </div>
    </div>
  )
} 