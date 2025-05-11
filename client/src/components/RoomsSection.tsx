"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RoomForm, RoomList, type RoomFormData } from "@/components/RoomFormField"
import { Bed, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface RoomsSectionProps {
  rooms: RoomFormData[]
  onAddRoom: (room: RoomFormData) => void
  onRemoveRoom: (index: number) => void
}

export const RoomsSection = ({ rooms, onAddRoom, onRemoveRoom }: RoomsSectionProps) => {
  const [isOpen, setIsOpen] = useState(true) // Default to open
  const [showForm, setShowForm] = useState(false)

  const handleAddRoom = (room: RoomFormData) => {
    onAddRoom(room)
    setShowForm(false)
  }

  const handleCancel = () => {
    setShowForm(false)
  }

  return (
    <div className="bg-[#0B1120]/80 border border-[#1E2A45] rounded-lg overflow-hidden mb-6 shadow-lg">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1E2A45] rounded-lg text-[#4F9CF9]">
            <Bed size={20} />
          </div>
          <h2 className="text-lg font-semibold text-white">Rooms</h2>
          {rooms.length > 0 && (
            <span className="bg-[#1E3A8A]/30 text-[#60A5FA] text-xs font-medium px-2.5 py-0.5 rounded-full">
              {rooms.length}
            </span>
          )}
        </div>
        <div className="text-gray-400">{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-[#1E2A45] bg-[#0B1120]/60">
              <div className="space-y-6">
                {/* Show room form if adding a new room */}
                {showForm && (
                  <div className="mb-6">
                    <RoomForm onAddRoom={handleAddRoom} onCancel={handleCancel} />
                  </div>
                )}

                {/* Show list of added rooms */}
                {rooms.length > 0 && <RoomList rooms={rooms} onRemoveRoom={onRemoveRoom} />}

                {/* Show add room button */}
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowForm(true)
                    }}
                    className="bg-[#1E2A45] hover:bg-[#2A3A55] text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {rooms.length === 0 ? "Add First Room" : "Add Another Room"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
