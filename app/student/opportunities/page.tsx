"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Navigation } from "@/components/layout/navigation"
import { Calendar, Clock, MapPin, Users, Search, Filter, Heart, CheckCircle, Star } from "lucide-react"

export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null)
  const [registeredOpportunities, setRegisteredOpportunities] = useState<number[]>([])

  const [opportunities] = useState([
    {
      id: 1,
      title: "Community Garden Cleanup",
      organization: "Green Valley Initiative",
      category: "Environment",
      date: "2024-01-20",
      time: "9:00 AM - 12:00 PM",
      location: "Central Park Community Garden",
      address: "123 Park Ave, Clovis, CA",
      spots: 15,
      registered: 8,
      description:
        "Join us for a morning of community service as we clean and maintain our local community garden. Activities include weeding, planting, and general maintenance.",
      requirements: ["Bring work gloves", "Wear closed-toe shoes", "Water bottle recommended"],
      coordinator: "Maria Rodriguez",
      coordinatorEmail: "maria@greenvalley.org",
      estimatedHours: 3,
      tags: ["Outdoors", "Physical", "Community"],
    },
    {
      id: 2,
      title: "Youth Mentoring Program",
      organization: "CATA Elementary",
      category: "Education",
      date: "2024-01-22",
      time: "3:30 PM - 5:00 PM",
      location: "CATA Elementary School",
      address: "456 School St, Clovis, CA",
      spots: 10,
      registered: 6,
      description:
        "Help elementary students with homework and reading activities. This is an ongoing program that meets twice weekly.",
      requirements: ["Background check required", "Commitment to 4+ sessions", "Patience with children"],
      coordinator: "Jennifer Smith",
      coordinatorEmail: "j.smith@cata.edu",
      estimatedHours: 1.5,
      tags: ["Education", "Children", "Ongoing"],
    },
    {
      id: 3,
      title: "Animal Shelter Support",
      organization: "Valley Animal Rescue",
      category: "Animals",
      date: "2024-01-25",
      time: "10:00 AM - 2:00 PM",
      location: "Valley Animal Shelter",
      address: "789 Rescue Rd, Fresno, CA",
      spots: 12,
      registered: 4,
      description:
        "Assist with animal care including feeding, cleaning kennels, and socializing with animals. Great for animal lovers!",
      requirements: ["Comfortable with animals", "Closed-toe shoes required", "Follow safety protocols"],
      coordinator: "David Chen",
      coordinatorEmail: "david@valleyrescue.org",
      estimatedHours: 4,
      tags: ["Animals", "Physical", "Rewarding"],
    },
    {
      id: 4,
      title: "Senior Technology Workshop",
      organization: "Clovis Senior Center",
      category: "Technology",
      date: "2024-01-27",
      time: "1:00 PM - 4:00 PM",
      location: "Clovis Senior Center",
      address: "321 Senior Way, Clovis, CA",
      spots: 8,
      registered: 3,
      description:
        "Help seniors learn to use smartphones, tablets, and computers. Teach basic skills like email, video calls, and internet browsing.",
      requirements: ["Tech-savvy", "Patient teaching style", "Good communication skills"],
      coordinator: "Susan Williams",
      coordinatorEmail: "susan@clovisseniors.org",
      estimatedHours: 3,
      tags: ["Technology", "Seniors", "Teaching"],
    },
    {
      id: 5,
      title: "Food Bank Distribution",
      organization: "Central Valley Food Bank",
      category: "Community Service",
      date: "2024-01-30",
      time: "8:00 AM - 12:00 PM",
      location: "Food Bank Warehouse",
      address: "555 Distribution Dr, Fresno, CA",
      spots: 20,
      registered: 12,
      description:
        "Help sort, pack, and distribute food to families in need. This is physical work that makes a direct impact on hunger in our community.",
      requirements: ["Ability to lift 25+ lbs", "Comfortable standing for long periods", "Team player"],
      coordinator: "Michael Torres",
      coordinatorEmail: "michael@cvfoodbank.org",
      estimatedHours: 4,
      tags: ["Community", "Physical", "High Impact"],
    },
    {
      id: 6,
      title: "Library Reading Program",
      organization: "Clovis Public Library",
      category: "Education",
      date: "2024-02-01",
      time: "4:00 PM - 6:00 PM",
      location: "Main Library",
      address: "1155 5th St, Clovis, CA",
      spots: 6,
      registered: 2,
      description:
        "Read stories to children during the weekly reading program. Help foster a love of reading in young minds.",
      requirements: ["Comfortable reading aloud", "Good with children", "Reliable attendance"],
      coordinator: "Lisa Park",
      coordinatorEmail: "lisa@clovislibrary.org",
      estimatedHours: 2,
      tags: ["Education", "Children", "Reading"],
    },
  ])

  const categories = ["all", "Environment", "Education", "Animals", "Technology", "Community Service"]

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || opp.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleRegister = (opportunityId: number) => {
    setRegisteredOpportunities([...registeredOpportunities, opportunityId])
    setSelectedOpportunity(null)
  }

  const isRegistered = (opportunityId: number) => registeredOpportunities.includes(opportunityId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-background to-accent/50">
      {/* Navigation Component */}
      <Navigation userRole="student" userName="Sarah Johnson" pendingNotifications={2} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Volunteer Opportunities</h2>
          <p className="text-muted-foreground font-sans">
            Discover meaningful ways to give back to your community and gain valuable experience.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 animate-slide-in-right">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search opportunities, organizations, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 font-sans"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48 font-sans">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="font-sans">
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground font-sans">
            Showing {filteredOpportunities.length} of {opportunities.length} opportunities
          </p>
        </div>

        {/* Opportunities Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredOpportunities.map((opportunity, index) => (
            <Card
              key={opportunity.id}
              className="border-border hover:border-primary/40 transition-all hover:shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="font-sans">
                        {opportunity.category}
                      </Badge>
                      {isRegistered(opportunity.id) && (
                        <Badge className="bg-green-100 text-green-800 font-sans">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Registered
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-serif text-lg mb-1">{opportunity.title}</CardTitle>
                    <CardDescription className="font-sans text-secondary font-semibold">
                      {opportunity.organization}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground font-sans mb-4 line-clamp-2">{opportunity.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm font-sans">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(opportunity.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {opportunity.time}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {opportunity.location}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {opportunity.registered}/{opportunity.spots} spots
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {opportunity.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs font-sans">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-sans text-muted-foreground">{opportunity.estimatedHours} hours</span>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-sans bg-transparent"
                          onClick={() => setSelectedOpportunity(opportunity)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        {selectedOpportunity && (
                          <>
                            <DialogHeader>
                              <DialogTitle className="font-serif text-xl">{selectedOpportunity.title}</DialogTitle>
                              <DialogDescription className="font-sans text-secondary font-semibold">
                                {selectedOpportunity.organization}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-serif font-semibold mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground font-sans">
                                  {selectedOpportunity.description}
                                </p>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-serif font-semibold mb-2">Event Details</h4>
                                  <div className="space-y-2 text-sm font-sans">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                      {new Date(selectedOpportunity.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                      {selectedOpportunity.time}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                      {selectedOpportunity.address}
                                    </div>
                                    <div className="flex items-center">
                                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                      {selectedOpportunity.registered}/{selectedOpportunity.spots} registered
                                    </div>
                                    <div className="flex items-center">
                                      <Star className="h-4 w-4 mr-2 text-muted-foreground" />
                                      {selectedOpportunity.estimatedHours} estimated hours
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-serif font-semibold mb-2">Coordinator</h4>
                                  <div className="text-sm font-sans">
                                    <p className="font-semibold">{selectedOpportunity.coordinator}</p>
                                    <p className="text-muted-foreground">{selectedOpportunity.coordinatorEmail}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-serif font-semibold mb-2">Requirements</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground font-sans">
                                  {selectedOpportunity.requirements.map((req: string, index: number) => (
                                    <li key={index}>{req}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-serif font-semibold mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedOpportunity.tags.map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="font-sans">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => handleRegister(selectedOpportunity.id)}
                                disabled={isRegistered(selectedOpportunity.id)}
                                className="font-sans font-semibold"
                              >
                                {isRegistered(selectedOpportunity.id) ? "Already Registered" : "Register Now"}
                              </Button>
                            </DialogFooter>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      onClick={() => handleRegister(opportunity.id)}
                      disabled={isRegistered(opportunity.id)}
                      className="font-sans font-semibold"
                    >
                      {isRegistered(opportunity.id) ? "Registered" : "Register"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-serif font-semibold mb-2">No opportunities found</h3>
            <p className="text-muted-foreground font-sans">
              Try adjusting your search terms or filters to find more opportunities.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
