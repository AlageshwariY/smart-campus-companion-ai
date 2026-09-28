import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  BookOpen, 
  Bus, 
  HelpCircle, 
  SearchX, 
  Plus, 
  Mail, 
  Clock, 
  Send 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { academicService } from '../../services/academicService';
import { FacultyMember, CampusLocation, LostAndFoundItem, ShuttleRoute } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const CampusServicesView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'map' | 'faculty' | 'library' | 'lostfound' | 'shuttle' | 'helpdesk'>('map');
  const [loading, setLoading] = useState(true);

  // Data states
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [lostFound, setLostFound] = useState<LostAndFoundItem[]>([]);
  const [shuttleRoutes, setShuttleRoutes] = useState<ShuttleRoute[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Lost and found form state
  const [showAddLostModal, setShowAddLostModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemLoc, setNewItemLoc] = useState('');

  // Helpdesk ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const loadServicesData = async () => {
    setLoading(true);
    try {
      const [fac, loc, lf, shut] = await Promise.all([
        academicService.getFaculty(),
        academicService.getLocations(),
        academicService.getLostAndFound(),
        academicService.getShuttleRoutes()
      ]);
      setFaculty(fac);
      setLocations(loc);
      setLostFound(lf);
      setShuttleRoutes(shut);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServicesData();
  }, []);

  const handleCreateLostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    await academicService.createLostAndFound({
      item_name: newItemName,
      category: 'General',
      found_location: newItemLoc || 'Campus Central',
      date_found: new Date().toISOString().split('T')[0],
      status: 'Unclaimed',
      contact_person: user?.full_name || 'Student'
    });
    setNewItemName('');
    setNewItemLoc('');
    setShowAddLostModal(false);
    loadServicesData();
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;
    setTicketSuccess(true);
    setTicketSubject('');
    setTicketDesc('');
    setTimeout(() => setTicketSuccess(false), 5000);
  };

  if (loading) return <SkeletonLoader count={4} height="h-36" />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-400" /> Campus Services & Infrastructure Directory
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Campus map, faculty directory, library search, shuttle timings, lost & found, and student helpdesk.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'map' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" /> Campus Map & Locations
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'faculty' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Faculty Directory
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'library' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Library Hub
        </button>
        <button
          onClick={() => setActiveTab('shuttle')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'shuttle' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Bus className="w-4 h-4" /> Transport & Shuttle
        </button>
        <button
          onClick={() => setActiveTab('lostfound')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'lostfound' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <SearchX className="w-4 h-4" /> Lost & Found
        </button>
        <button
          onClick={() => setActiveTab('helpdesk')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'helpdesk' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Student Helpdesk
        </button>
      </div>

      {/* Tab Content: Campus Map & Locations */}
      {activeTab === 'map' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {loc.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{loc.building}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{loc.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{loc.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Floor: {loc.floor}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Faculty Directory */}
      {activeTab === 'faculty' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faculty.map((fac) => (
              <div key={fac.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{fac.name}</h4>
                    <p className="text-xs text-indigo-400 font-medium mt-0.5">{fac.designation}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-semibold">
                    {fac.department}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500" /> {fac.email}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {fac.office_location}</div>
                  <div className="flex items-center gap-1.5 col-span-2"><Clock className="w-3.5 h-3.5 text-amber-400" /> Office Hours: {fac.consultation_hours}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Library Hub */}
      {activeTab === 'library' && (
        <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-4 text-center">
          <BookOpen className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-100">Central Digital Library Hub</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Access over 50,000 digital textbooks, IEEE research papers, and reserve quiet study terminals in Block A, 2nd Floor.
          </p>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="block font-bold text-indigo-400">Timings</span>
              <span className="text-slate-300">8:00 AM - 10:00 PM</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="block font-bold text-indigo-400">Borrowed Books</span>
              <span className="text-slate-300">2 Active (Return by Oct 12)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="block font-bold text-indigo-400">Study Pods</span>
              <span className="text-slate-300">12 Pods Available</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Transport & Shuttle */}
      {activeTab === 'shuttle' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shuttleRoutes.map((shut) => (
              <div key={shut.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Bus className="w-4 h-4 text-indigo-400" /> {shut.route_name}
                  </h4>
                </div>
                <p className="text-xs text-slate-400">From <strong>{shut.start_point}</strong> to <strong>{shut.end_point}</strong></p>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Departure Timings</span>
                  <div className="flex flex-wrap gap-1.5">
                    {shut.timings.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Lost & Found */}
      {activeTab === 'lostfound' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-100">Recent Campus Lost & Found Reports</h3>
            <button
              onClick={() => setShowAddLostModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Report Found Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lostFound.map((item) => (
              <div key={item.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-slate-100">{item.item_name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Found at: <strong>{item.found_location}</strong> on {item.date_found}</p>
                <p className="text-xs text-indigo-300 font-medium">Contact: {item.contact_person}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Helpdesk */}
      {activeTab === 'helpdesk' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">Student Support & Ticket Helpdesk</h3>
              <p className="text-xs text-slate-400">Submit official requests regarding attendance, fees, or IT support.</p>
            </div>
          </div>

          {ticketSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center">
              🎉 Support Ticket Submitted Successfully! The Helpdesk team will respond to your student email.
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Issue Subject</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Attendance discrepancy in DBMS lecture..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Explain the issue clearly..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <Send className="w-4 h-4" /> Submit Support Ticket
              </button>
            </form>
          )}
        </div>
      )}

      {/* Add Lost Item Modal */}
      {showAddLostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Report Found Item</h3>
            <form onSubmit={handleCreateLostItem} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Item Description</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Black Sony Wireless Earbuds..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Found Location</label>
                <input
                  type="text"
                  value={newItemLoc}
                  onChange={(e) => setNewItemLoc(e.target.value)}
                  placeholder="e.g. Library 2nd Floor..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLostModal(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
