import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import "./admin.css";

const STORAGE_KEY = "air_dream_site_data_v2";

export default function AdminPanel() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Main Website Data State
  const [siteData, setSiteData] = useState({
    wallpapers: [],
    attractions: [],
    whyChooseUs: [],
    tours: [],
    transfers: [],
    holidayPackages: [],
    gallery: [],
    packages: [],
    reviews: [],
    settings: {
      brandName: "AIR DREAM",
      brandTagline: "TRAVEL TOURISM LLC",
      phone: "+971 58 833 8927",
      whatsapp: "971588338927",
      email: "sales@airdreamtravel.com",
      address: "Office 402, Al Asmawi Building, Sheikh Zayed Road, Dubai, UAE",
      logoUrl: "/assets/air-dream-logo.png",
      aboutQuote:
        "Your trusted gateway to magical journeys, sacred pilgrimages, and bespoke world discoveries.",
      aboutArchImg:
        "https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=800&q=80",
      bubble1Img:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&q=80",
      bubble2Img:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80",
      bubble3Img:
        "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=300&q=80",
    },
  });

  // Customer Inquiries from Backend / Local
  const [enquiries, setEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [isAddEnquiryOpen, setIsAddEnquiryOpen] = useState(false);
  const [newEnquiryForm, setNewEnquiryForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    serviceRequired: "Dubai Luxury Tour",
    message: "",
  });

  // Search Filters
  const [searchAttractions, setSearchAttractions] = useState("");
  const [searchTours, setSearchTours] = useState("");
  const [searchHolidayPackages, setSearchHolidayPackages] = useState("");
  const [searchEnquiries, setSearchEnquiries] = useState("");

  // Universal Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCollection, setModalCollection] = useState("attraction");
  const [editingItemId, setEditingItemId] = useState(null);
  const [modalFormData, setModalFormData] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [inclusionsRawText, setInclusionsRawText] = useState("");
  const [singleInclusionInput, setSingleInclusionInput] = useState("");
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [isSavingEnquiry, setIsSavingEnquiry] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(siteData.settings);

  // Hidden file input for Import JSON
  const importFileRef = useRef(null);

  // Load Data on Mount & Listen for Real-Time Customer Inquiries
  useEffect(() => {
    loadLocalSiteData();
    fetchBackendEnquiries();

    const handleNewEnquiry = (e) => {
      if (e?.detail) {
        setEnquiries((prev) => {
          const id = e.detail._id || e.detail.id;
          if (prev.some((item) => (item._id || item.id) === id)) return prev;
          const updated = [e.detail, ...prev];
          localStorage.setItem(
            "air_dream_enquiries_v2",
            JSON.stringify(updated),
          );
          return updated;
        });
        toast.success(
          `New customer inquiry: ${e.detail.fullName || "Visitor"}`,
        );
      } else {
        fetchBackendEnquiries();
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "air_dream_enquiries_v2") {
        fetchBackendEnquiries();
      }
    };

    window.addEventListener("airdream:enquiry_added", handleNewEnquiry);
    window.addEventListener("airdream-enquiry-added", handleNewEnquiry);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("airdream:enquiry_added", handleNewEnquiry);
      window.removeEventListener("airdream-enquiry-added", handleNewEnquiry);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Refresh customer inquiries automatically whenever switching to the inquiries tab
  useEffect(() => {
    if (activeTab === "enquiries") {
      fetchBackendEnquiries();
    }
  }, [activeTab]);

  // Update Settings Form when siteData.settings changes
  useEffect(() => {
    if (siteData.settings) {
      setSettingsForm(siteData.settings);
    }
  }, [siteData.settings]);

  // Load site data from backend API or localStorage fallback
  const loadLocalSiteData = async () => {
    try {
      // 1. Try fresh data from backend
      const apiRes = await api.get("/site-content");
      if (apiRes.data && Object.keys(apiRes.data).length > 0) {
        const data = apiRes.data;
        if (
          !data.whyChooseUs ||
          data.whyChooseUs.length === 0 ||
          data.whyChooseUs[0]?.title === "Global Reach"
        ) {
          const defRes = await fetch("/data/default-data.json");
          if (defRes.ok) {
            const defs = await defRes.json();
            data.whyChooseUs = defs.whyChooseUs || [];
          }
        }
        setSiteData(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return;
      }
    } catch (e) {
      // Offline fallback below
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          !parsed.whyChooseUs ||
          parsed.whyChooseUs.length === 0 ||
          parsed.whyChooseUs[0]?.title === "Global Reach" ||
          parsed.whyChooseUs[0]?.title === "Tour Guide"
        ) {
          const defRes = await fetch("/data/default-data.json");
          if (defRes.ok) {
            const defs = await defRes.json();
            parsed.whyChooseUs = defs.whyChooseUs || [];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
        }
        setSiteData(parsed);
        return;
      }

      // Fetch default-data.json fallback
      const res = await fetch("/data/default-data.json");
      if (res.ok) {
        const defaults = await res.json();
        setSiteData(defaults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      }
    } catch (err) {
      console.warn("Could not load site data:", err);
    }
  };

  // Fetch backend enquiries and merge with locally stored inquiries
  const fetchBackendEnquiries = async () => {
    setLoadingEnquiries(true);
    let remoteList = [];
    try {
      const res = await api.get("/enquiries");
      if (res.data) {
        remoteList = Array.isArray(res.data)
          ? res.data
          : res.data.enquiries || [];
      }
    } catch (err) {
      console.warn("Backend enquiries fetch fallback:", err.message);
    }

    try {
      const localList = JSON.parse(
        localStorage.getItem("air_dream_enquiries_v2") || "[]",
      );

      // Merge both sources without duplicates
      const mergedMap = new Map();
      [...remoteList, ...localList].forEach((item) => {
        const id = String(item._id || item.id || "");
        if (id && !mergedMap.has(id)) {
          mergedMap.set(id, { ...item, _id: id, id });
        }
      });

      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );

      if (merged.length > 0) {
        setEnquiries(merged);
        localStorage.setItem("air_dream_enquiries_v2", JSON.stringify(merged));
      } else {
        // Seed default initial inquiries if completely empty
        const initialSeeds = [
          {
            _id: "enq-101",
            fullName: "Ahmed Al Mansoori",
            email: "ahmed.mansoori@gmail.com",
            phone: "+971 50 123 4567",
            serviceRequired: "Dubai Luxury Skyline Tour",
            destination: "Dubai",
            message:
              "Looking for a private VIP 4WD tour for family of 4 next weekend.",
            isRead: false,
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            _id: "enq-102",
            fullName: "Fatima Zahra",
            email: "fatima.z@outlook.com",
            phone: "+968 91 234 567",
            serviceRequired: "5-Star Executive Umrah Package",
            destination: "Makkah & Madinah",
            message:
              "Need 10 days full package with Courtyard View hotel and private GMC transfer.",
            isRead: true,
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ];
        setEnquiries(initialSeeds);
        localStorage.setItem(
          "air_dream_enquiries_v2",
          JSON.stringify(initialSeeds),
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  // Save site data to localStorage, sync to backend, and dispatch events for live site synchronization
  const saveSiteData = (newData) => {
    try {
      setSiteData(newData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      } catch (storageErr) {
        console.warn("Storage quota exceeded or restricted, saving essential state:", storageErr);
        try {
          const sanitized = JSON.parse(JSON.stringify(newData));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        } catch (innerErr) {
          console.warn("Could not save to localStorage:", innerErr);
        }
      }
      window.dispatchEvent(
        new CustomEvent("airdream:data_updated", { detail: newData }),
      );
      window.dispatchEvent(
        new CustomEvent("airdream-data-updated", { detail: newData }),
      );
      api.put("/site-content", newData).catch(() => {});
    } catch (err) {
      console.error("Error in saveSiteData:", err);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/admin/login");
  };

  // Open Universal Add Modal
  const openAddModal = (collection) => {
    setModalCollection(collection);
    setEditingItemId(null);
    setImagePreview("");
    const emptyForm = getEmptyFormFor(collection);
    setModalFormData(emptyForm);
    if (collection === "package") {
      const initIncs = emptyForm.inclusions || [];
      setInclusionsRawText(
        Array.isArray(initIncs)
          ? initIncs.map((i) => (typeof i === "object" ? i.text : i)).join(", ")
          : ""
      );
      setSingleInclusionInput("");
    }
    setIsModalOpen(true);
  };

  // Open Universal Edit Modal
  const openEditModal = (collection, item) => {
    setModalCollection(collection);
    const itemId = item.id || item._id;
    setEditingItemId(itemId);
    const preview = item.image || item.avatar || item.img || "";
    setImagePreview(preview);
    const isFeat = Boolean(item.featured ?? item.isFeatured);
    const initIncs = Array.isArray(item.inclusions)
      ? item.inclusions.map((i) => (typeof i === "object" ? i.text : i)).filter(Boolean)
      : (typeof item.inclusions === "string" ? item.inclusions.split(",").map((s) => s.trim()).filter(Boolean) : []);

    setModalFormData({
      ...item,
      featured: isFeat,
      isFeatured: isFeat,
      category: item.category || "tours",
      inclusions: initIncs,
      image: item.image || item.img || preview,
    });

    if (collection === "package") {
      setInclusionsRawText(initIncs.join(", "));
      setSingleInclusionInput("");
    }
    setIsModalOpen(true);
  };

  // Close Universal Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItemId(null);
    setModalFormData({});
    setImagePreview("");
    setInclusionsRawText("");
    setSingleInclusionInput("");
  };

  // Helper for empty form state
  const getEmptyFormFor = (collection) => {
    switch (collection) {
      case "wallpaper":
        return {
          badge: "Premium Flight Booking",
          badgeIcon: "fa-plane",
          title: "Fly Anywhere at the",
          highlight: "Best Fares",
          desc: "Experience seamless global connections with world-class airlines.",
          image: "",
          primaryBtnText: "Book Your Flight",
          primaryBtnLink: "#packages",
          secondaryBtnText: "Request Custom Quote",
        };
      case "attraction":
        return {
          name: "",
          activities: "100+ activities",
          price: "$65",
          btnText: "Book Now",
          image: "",
        };
      case "gallery":
        return {
          title: "",
          location: "Salalah, Oman",
          image: "",
        };
      case "tour":
        return {
          title: "",
          tagline: "Dubai, UAE",
          location: "Dubai, UAE",
          image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
          duration: "08-Hrs",
          hours: "08-Hrs",
          vehicle: "4WD Cruiser",
          carHours: "08-Hrs Car",
          guide: "Driver-guide",
          capacity: "4 Persons",
          price: "$120",
          rating: 5.0,
          inclusions: [
            "4WD Land Cruiser",
            "Hotel Pickup & Drop",
            "Lunch & Refreshments",
            "English/Arabic Guide",
          ],
        };
      case "holidayPackage":
        return {
          title: "",
          tagline: "Dubai, UAE",
          location: "Dubai, UAE",
          image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
          duration: "Full Day",
          hours: "Full Day",
          vehicle: "Luxury Sprinter",
          carHours: "Luxury Sprinter",
          guide: "Park Concierge",
          capacity: "2–8 Guests",
          price: "$135",
          rating: 5.0,
        };
      case "transfer":
        return {
          title: "",
          category: "Luxury Fleet",
          image: "",
          passengers: 4,
          luggage: 3,
          price: "$45",
          features: [
            "Flight Tracking",
            "Free 60m Wait Time",
            "Air-Conditioned VIP",
          ],
        };
      case "package":
        return {
          title: "",
          category: "tours",
          badge: "Best Seller",
          badgeColor: "bg-emerald-600",
          image: "",
          duration: "5 Days / 4 Nights",
          price: "$799",
          featured: false,
          isFeatured: false,
          inclusions: [
            "5-Star Hotel",
            "Daily Breakfast",
            "Guided Excursions",
            "Airport VIP Transfers",
          ],
        };
      case "review":
        return {
          name: "",
          stars: 5,
          quote: "",
          avatar: "",
        };
      case "whyChooseUs":
      case "feature":
        return {
          title: "",
          titleFormatted: "",
          icon: "✈️",
          description: "",
          desc: "",
          price: "From $299",
          badge: "Featured",
          image: "/assets/cards/card1.png",
          fallback: "/assets/cards/card1.png",
        };
      default:
        return {};
    }
  };

  // Universal Image Uploader: Posts to /api/upload with fallback to compressed DataURL
  const uploadImageFile = async (file) => {
    if (!file) return null;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size exceeds 20MB. Please choose a smaller image.");
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 4000,
      });
      if (res.data?.url) {
        return res.data.url;
      }
    } catch (err) {
      console.warn(
        "Backend /api/upload error, falling back to local compressed image:",
        err?.message,
      );
    }

    // Fallback: Read and compress image via HTML5 Canvas to prevent storage quota issues
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const rawUrl = evt.target.result;
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            let { width, height } = img;
            const maxDim = 1200;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.82);
            resolve(compressed);
          } catch (canvasErr) {
            resolve(rawUrl);
          }
        };
        img.onerror = () => resolve(rawUrl);
        img.src = rawUrl;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // Modal File Upload Handler (Direct file to server or local preview)
  const handleModalFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);
    setImagePreview(tempUrl);
    setUploadingImage(true);

    try {
      const finalUrl = await uploadImageFile(file);
      if (finalUrl) {
        setImagePreview(finalUrl);
        if (modalCollection === "review") {
          setModalFormData((prev) => ({ ...prev, avatar: finalUrl }));
        } else {
          setModalFormData((prev) => ({ ...prev, image: finalUrl }));
        }
        toast.success("Card picture uploaded successfully!");
      }
    } catch (err) {
      toast.error("Could not process picture upload.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Settings File Upload Handler
  const handleSettingsFileUpload = async (field, file) => {
    if (!file) return;
    toast.loading("Uploading image...", { id: "settings-upload" });
    try {
      const finalUrl = await uploadImageFile(file);
      toast.dismiss("settings-upload");
      if (finalUrl) {
        setSettingsForm((prev) => ({ ...prev, [field]: finalUrl }));
        toast.success("Image updated successfully!");
      }
    } catch (err) {
      toast.dismiss("settings-upload");
      toast.error("Error updating image.");
    }
  };

  // Submit Modal Form (Instant Optimistic Save for All Card Collections)
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingModal) return;

    if (uploadingImage) {
      toast.loading("Please wait for picture to finish uploading...", { id: "upload-wait", duration: 1500 });
      return;
    }

    setIsSubmittingModal(true);

    try {
      const collKeyMap = {
        wallpaper: "wallpapers",
        attraction: "attractions",
        gallery: "gallery",
        tour: "tours",
        transfer: "transfers",
        holidayPackage: "holidayPackages",
        package: "packages",
        review: "reviews",
        whyChooseUs: "whyChooseUs",
        feature: "whyChooseUs",
      };
      const collectionKey = collKeyMap[modalCollection];
      if (!collectionKey) {
        toast.error("Unknown card collection type.");
        setIsSubmittingModal(false);
        return;
      }

      const currentList = [...(siteData[collectionKey] || [])];

      let formDataToSave = { ...modalFormData };

      // Ensure required fallbacks for smooth, error-free saves
      if (modalCollection === "package") {
        let finalIncs = modalFormData.inclusions || [];
        if (typeof inclusionsRawText === "string" && inclusionsRawText.trim() !== "") {
          finalIncs = inclusionsRawText.split(",").map((s) => s.trim()).filter(Boolean);
        }
        formDataToSave = {
          ...modalFormData,
          title: (modalFormData.title || "Exclusive Travel Package").trim(),
          price: (modalFormData.price || "$799").trim(),
          category: modalFormData.category || "tours",
          duration: modalFormData.duration || "5 Days / 4 Nights",
          badge: modalFormData.badge || "Best Seller",
          inclusions: Array.isArray(finalIncs) && finalIncs.length > 0 ? finalIncs : ["5-Star Hotel", "Daily Breakfast", "VIP Transfers"],
          featured: Boolean(modalFormData.featured),
          isFeatured: Boolean(modalFormData.featured),
        };
      } else if (modalCollection === "wallpaper") {
        formDataToSave = {
          ...modalFormData,
          badge: (modalFormData.badge || "Premium Travel").trim(),
          badgeIcon: modalFormData.badgeIcon || "fa-plane",
          title: (modalFormData.title || "Experience World-Class").trim(),
          highlight: (modalFormData.highlight || "Travel Deals").trim(),
          desc: modalFormData.desc || "Unforgettable journeys tailored to perfection.",
        };
      } else if (modalCollection === "attraction") {
        formDataToSave = {
          ...modalFormData,
          name: (modalFormData.name || "Dubai Landmark Attraction").trim(),
          price: (modalFormData.price || "$49").trim(),
          activities: modalFormData.activities || "Multiple activities available",
        };
      } else if (modalCollection === "holidayPackage") {
        const cleanPrice = (modalFormData.price || "$135").trim();
        formDataToSave = {
          ...modalFormData,
          title: (modalFormData.title || "Special Holiday Package").trim(),
          price: cleanPrice.startsWith("$") || cleanPrice.toLowerCase().includes("aed") || cleanPrice.toLowerCase().includes("omr") ? cleanPrice : `${cleanPrice}`,
          duration: modalFormData.duration || modalFormData.hours || "Full Day",
          hours: modalFormData.hours || modalFormData.duration || "Full Day",
          location: (modalFormData.location || modalFormData.tagline || "Dubai, UAE").trim(),
          tagline: (modalFormData.tagline || modalFormData.location || "Dubai, UAE").trim(),
          vehicle: modalFormData.vehicle || modalFormData.carHours || "Luxury Sprinter",
          carHours: modalFormData.carHours || modalFormData.vehicle || "Luxury Sprinter",
          guide: (modalFormData.guide || "Park Concierge").trim(),
          capacity: (modalFormData.capacity || modalFormData.groupSize || "2–8 Guests").trim(),
          rating: modalFormData.rating ? `${modalFormData.rating}` : "5.0",
        };
      } else if (modalCollection === "tour") {
        const cleanPrice = (modalFormData.price || "$120").trim();
        formDataToSave = {
          ...modalFormData,
          title: (modalFormData.title || "Guided Excursion Tour").trim(),
          price: cleanPrice.startsWith("$") || cleanPrice.toLowerCase().includes("aed") || cleanPrice.toLowerCase().includes("omr") ? cleanPrice : `$${cleanPrice}`,
          duration: modalFormData.duration || modalFormData.hours || "08-Hrs",
          hours: modalFormData.hours || modalFormData.duration || "08-Hrs",
          location: (modalFormData.location || modalFormData.tagline || "Dubai, UAE").trim(),
          tagline: (modalFormData.tagline || modalFormData.location || "Dubai, UAE").trim(),
          vehicle: modalFormData.vehicle || modalFormData.carHours || "4WD Cruiser",
          carHours: modalFormData.carHours || modalFormData.vehicle || "08-Hrs Car",
          guide: (modalFormData.guide || "Driver-guide").trim(),
          capacity: (modalFormData.capacity || modalFormData.groupSize || "4 Persons").trim(),
          rating: modalFormData.rating ? `${modalFormData.rating}` : "5.0",
        };
      } else if (modalCollection === "transfer") {
        formDataToSave = {
          ...modalFormData,
          title: (modalFormData.title || "VIP Chauffeur & Airport Transfer").trim(),
          price: (modalFormData.price || "$45").trim(),
          category: modalFormData.category || "Luxury Fleet",
        };
      } else if (modalCollection === "gallery") {
        formDataToSave = {
          ...modalFormData,
          title: (modalFormData.title || "Scenic Travel Moments").trim(),
          location: modalFormData.location || "Dubai & Salalah",
        };
      } else if (modalCollection === "review") {
        formDataToSave = {
          ...modalFormData,
          name: (modalFormData.name || "Verified Guest").trim(),
          quote: (modalFormData.quote || "Exceptional service and unforgettable trip!").trim(),
          stars: modalFormData.stars || 5,
        };
      } else if (modalCollection === "whyChooseUs" || modalCollection === "feature") {
        formDataToSave = {
          ...modalFormData,
          title: (modalFormData.title || "Premium Service Guarantee").trim(),
          description: (modalFormData.description || modalFormData.desc || "Dedicated round-the-clock concierge support.").trim(),
          desc: (modalFormData.description || modalFormData.desc || "Dedicated round-the-clock concierge support.").trim(),
        };
      }

      let updatedList;
      if (editingItemId) {
        // Edit existing
        updatedList = currentList.map((item) => {
          const id = item.id || item._id;
          if (id === editingItemId) {
            return { ...item, ...formDataToSave, id };
          }
          return item;
        });
        toast.success(`Updated ${modalCollection} successfully!`);
      } else {
        // Add new
        const newItem = {
          ...formDataToSave,
          id: `${modalCollection.slice(0, 3)}-${Date.now()}`,
        };
        updatedList = [newItem, ...currentList];
        toast.success(`Added new ${modalCollection} successfully!`);
      }

      const updatedSiteData = {
        ...siteData,
        [collectionKey]: updatedList,
      };

      // 1. Instant optimistic local save and live event trigger
      saveSiteData(updatedSiteData);

      // 2. Close modal immediately so interface is super snappy
      closeModal();

      // 3. Fire-and-forget background server sync
      setTimeout(() => {
        try {
          if (modalCollection === "whyChooseUs" || modalCollection === "feature") {
            if (!editingItemId) {
              api.post("/why-choose-us", formDataToSave).catch(() => {});
            } else {
              api.put(`/why-choose-us/${editingItemId}`, formDataToSave).catch(() => {});
            }
          } else if (modalCollection === "wallpaper") {
            if (!editingItemId) {
              api.post("/wallpapers", formDataToSave).catch(() => {});
            } else {
              api.put(`/wallpapers/${editingItemId}`, formDataToSave).catch(() => {});
            }
          } else if (modalCollection === "attraction") {
            if (!editingItemId) {
              api.post("/activities", {
                name: formDataToSave.name,
                title: formDataToSave.name,
                activities: formDataToSave.activities,
                price: parseFloat((formDataToSave.price || "0").replace(/[^0-9.]/g, "")) || 50,
                image: formDataToSave.image,
                images: [formDataToSave.image],
              }).catch(() => {});
            } else {
              api.put(`/activities/${editingItemId}`, formDataToSave).catch(() => {});
            }
          } else if (modalCollection === "tour") {
            if (!editingItemId) {
              api.post("/tours", formDataToSave).catch(() => {});
            } else {
              api.put(`/tours/${editingItemId}`, formDataToSave).catch(() => {});
            }
          } else if (modalCollection === "holidayPackage") {
            if (!editingItemId) {
              api.post("/holiday-packages", formDataToSave).catch(() => {});
            } else {
              api.put(`/holiday-packages/${editingItemId}`, formDataToSave).catch(() => {});
            }
          } else if (modalCollection === "transfer") {
            if (!editingItemId) {
              api.post("/transfers", formDataToSave).catch(() => {});
            } else {
              api.put(`/transfers/${editingItemId}`, formDataToSave).catch(() => {});
            }
          } else if (modalCollection === "gallery") {
            if (!editingItemId) {
              api.post("/gallery", formDataToSave).catch(() => {});
            } else {
              api.put(`/gallery/${editingItemId}`, formDataToSave).catch(() => {});
            }
          } else if (modalCollection === "package") {
            if (!editingItemId) {
              api.post("/travel-deals", formDataToSave).catch(() => {});
            } else {
              api.put(`/travel-deals/${editingItemId}`, formDataToSave).catch(() => {});
            }
          } else if (modalCollection === "review") {
            if (!editingItemId) {
              api.post("/testimonials", {
                name: formDataToSave.name,
                quote: formDataToSave.quote,
                review: formDataToSave.quote,
                avatar: formDataToSave.avatar,
                rating: formDataToSave.stars || 5,
              }).catch(() => {});
            } else {
              api.put(`/testimonials/${editingItemId}`, formDataToSave).catch(() => {});
            }
          }
        } catch (syncErr) {
          console.warn("Background API sync handled locally:", syncErr);
        }
      }, 0);
    } catch (err) {
      console.error("Error submitting modal card form:", err);
      toast.error("Could not save card changes. Please check input values.");
    } finally {
      setIsSubmittingModal(false);
    }
  };

  // Delete Item Handler
  const handleDeleteItem = (collectionKey, itemId, itemName = "item") => {
    if (
      window.confirm(
        `Are you sure you want to delete "${itemName}"? This change will be visible immediately on the live website.`,
      )
    ) {
      const currentList = siteData[collectionKey] || [];
      const updatedList = currentList.filter(
        (item) => (item.id || item._id) !== itemId,
      );
      saveSiteData({
        ...siteData,
        [collectionKey]: updatedList,
      });

      // Synchronize deletion with backend endpoints
      try {
        if (collectionKey === "whyChooseUs") {
          api.delete(`/why-choose-us/${itemId}`).catch(() => {});
        } else if (collectionKey === "wallpapers") {
          api.delete(`/wallpapers/${itemId}`).catch(() => {});
        } else if (collectionKey === "attractions") {
          api.delete(`/activities/${itemId}`).catch(() => {});
        } else if (collectionKey === "tours") {
          api.delete(`/tours/${itemId}`).catch(() => {});
        } else if (collectionKey === "transfers") {
          api.delete(`/transfers/${itemId}`).catch(() => {});
        } else if (collectionKey === "holidayPackages") {
          api.delete(`/holiday-packages/${itemId}`).catch(() => {});
        } else if (collectionKey === "gallery") {
          api.delete(`/gallery/${itemId}`).catch(() => {});
        } else if (collectionKey === "packages") {
          api.delete(`/travel-deals/${itemId}`).catch(() => {});
        } else if (collectionKey === "reviews") {
          api.delete(`/testimonials/${itemId}`).catch(() => {});
        }
      } catch (err) {
        // Fallback handled locally
      }

      toast.success("Item deleted successfully.");
    }
  };

  // Quick toggle package featured status directly from card
  const handleTogglePackageFeatured = (packageId, newStatus) => {
    const currentPackages = siteData.packages || [];
    const updatedPackages = currentPackages.map((pkg) => {
      const id = pkg.id || pkg._id;
      if (id === packageId) {
        return {
          ...pkg,
          featured: newStatus,
          isFeatured: newStatus,
        };
      }
      return pkg;
    });

    const updatedSiteData = {
      ...siteData,
      packages: updatedPackages,
    };

    saveSiteData(updatedSiteData);
    toast.success(
      newStatus
        ? "Package marked as Featured!"
        : "Package removed from Featured.",
    );

    try {
      api
        .put(`/travel-deals/${packageId}`, {
          featured: newStatus,
          isFeatured: newStatus,
        })
        .catch(() => {});
    } catch (e) {}
  };

  // Inclusions Management Handlers for Package Modal
  const handleAddSingleInclusion = (e) => {
    if (e) e.preventDefault();
    const trimmed = singleInclusionInput.trim();
    if (!trimmed) return;

    const newItems = trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const currentList = Array.isArray(modalFormData.inclusions)
      ? modalFormData.inclusions.map((i) => (typeof i === "object" ? i.text : i))
      : [];

    const merged = [...currentList];
    newItems.forEach((item) => {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    });

    setModalFormData((prev) => ({
      ...prev,
      inclusions: merged,
    }));
    setInclusionsRawText(merged.join(", "));
    setSingleInclusionInput("");
  };

  const handleRemoveInclusion = (indexToRemove) => {
    const currentList = Array.isArray(modalFormData.inclusions)
      ? modalFormData.inclusions.map((i) => (typeof i === "object" ? i.text : i))
      : [];
    const updated = currentList.filter((_, idx) => idx !== indexToRemove);
    setModalFormData((prev) => ({
      ...prev,
      inclusions: updated,
    }));
    setInclusionsRawText(updated.join(", "));
  };

  const handleRawInclusionsChange = (text) => {
    setInclusionsRawText(text);
    const parsed = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setModalFormData((prev) => ({
      ...prev,
      inclusions: parsed,
    }));
  };

  const handleQuickAddInclusion = (presetName) => {
    const currentList = Array.isArray(modalFormData.inclusions)
      ? modalFormData.inclusions.map((i) => (typeof i === "object" ? i.text : i))
      : [];

    if (currentList.includes(presetName)) {
      handleRemoveInclusion(currentList.indexOf(presetName));
      return;
    }

    const updated = [...currentList, presetName];
    setModalFormData((prev) => ({
      ...prev,
      inclusions: updated,
    }));
    setInclusionsRawText(updated.join(", "));
  };

  const handleClearAllInclusions = () => {
    setModalFormData((prev) => ({
      ...prev,
      inclusions: [],
    }));
    setInclusionsRawText("");
  };

  // Enquiries Handlers
  const handleToggleEnquiryRead = async (enquiryId, currentRead) => {
    const newStatus = !currentRead;
    setEnquiries((prev) => {
      const updated = prev.map((enq) =>
        (enq._id || enq.id) === enquiryId ? { ...enq, isRead: newStatus } : enq,
      );
      localStorage.setItem("air_dream_enquiries_v2", JSON.stringify(updated));
      return updated;
    });

    try {
      await api.put(`/enquiries/${enquiryId}/read`, { isRead: newStatus });
    } catch (err) {}
    toast.success(`Enquiry marked as ${newStatus ? "Read" : "Unread"}`);
  };

  const handleDeleteEnquiry = async (enquiryId) => {
    if (
      !window.confirm("Are you sure you want to delete this customer inquiry?")
    )
      return;

    setEnquiries((prev) => {
      const updated = prev.filter((enq) => (enq._id || enq.id) !== enquiryId);
      localStorage.setItem("air_dream_enquiries_v2", JSON.stringify(updated));
      return updated;
    });

    try {
      await api.delete(`/enquiries/${enquiryId}`);
    } catch (err) {}
    toast.success("Enquiry deleted successfully.");
  };

  const handleCreateManualEnquiry = async (e) => {
    e.preventDefault();
    if (isSavingEnquiry) return;

    if (!newEnquiryForm.fullName.trim() || !newEnquiryForm.phone.trim()) {
      toast.error("Please provide at least customer name and phone number.");
      return;
    }

    setIsSavingEnquiry(true);

    const newEnq = {
      _id: `enq-${Date.now()}`,
      fullName: newEnquiryForm.fullName.trim(),
      phone: newEnquiryForm.phone.trim(),
      email: newEnquiryForm.email.trim() || "N/A",
      serviceRequired: newEnquiryForm.serviceRequired || "General Inquiry",
      message:
        newEnquiryForm.message.trim() ||
        "Manual customer booking logged by admin.",
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Instant local state update
    setEnquiries((prev) => {
      const updated = [newEnq, ...prev];
      try {
        localStorage.setItem("air_dream_enquiries_v2", JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    toast.success("Customer inquiry added successfully!");
    setIsAddEnquiryOpen(false);
    setNewEnquiryForm({
      fullName: "",
      phone: "",
      email: "",
      serviceRequired: "Dubai Luxury Tour",
      message: "",
    });
    setIsSavingEnquiry(false);

    // Non-blocking background API sync
    api.post("/enquiries", newEnq).catch((err) => {
      console.warn("Backend save fallback, saved locally:", err?.message);
    });
  };

  // Save Settings Handler (Instant Optimistic Save)
  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (isSavingSettings) return;
    setIsSavingSettings(true);
    try {
      const updated = {
        ...siteData,
        settings: settingsForm,
      };
      saveSiteData(updated);
      api.put("/settings", settingsForm).catch(() => {});
      toast.success("Site settings and contact details saved successfully!");
    } catch (err) {
      toast.error("Could not save settings.");
    } finally {
      setTimeout(() => setIsSavingSettings(false), 300);
    }
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(siteData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `airdream-backup-${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Backup JSON downloaded successfully!");
  };

  // Import JSON backup
  const handleImportJSON = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (parsed && typeof parsed === "object") {
          saveSiteData(parsed);
          toast.success(
            "Backup JSON imported and website restored successfully!",
          );
        } else {
          toast.error("Invalid backup JSON format.");
        }
      } catch (err) {
        toast.error("Failed to parse backup JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Reset to Factory Defaults
  const handleResetDefaults = async () => {
    if (
      window.confirm(
        "Reset all website content to factory defaults? Custom added items will be restored to initial template defaults.",
      )
    ) {
      try {
        const res = await fetch("/data/default-data.json");
        if (res.ok) {
          const defaults = await res.json();
          saveSiteData(defaults);
          toast.success("Website restored to factory defaults!");
        } else {
          toast.error("Failed to fetch default data.");
        }
      } catch (err) {
        toast.error("Error resetting defaults.");
      }
    }
  };

  // Filtered lists for search
  const filteredAttractions = useMemo(() => {
    const list = siteData.attractions || [];
    if (!searchAttractions.trim()) return list;
    const q = searchAttractions.toLowerCase();
    return list.filter((item) => (item.name || "").toLowerCase().includes(q));
  }, [siteData.attractions, searchAttractions]);

  const filteredHolidayPackages = useMemo(() => {
    const list = siteData.holidayPackages || [];
    if (!searchHolidayPackages.trim()) return list;
    const q = searchHolidayPackages.toLowerCase();
    return list.filter(
      (item) =>
        (item.title || "").toLowerCase().includes(q) ||
        (item.location || "").toLowerCase().includes(q) ||
        (item.tagline || "").toLowerCase().includes(q),
    );
  }, [siteData.holidayPackages, searchHolidayPackages]);

  const filteredTours = useMemo(() => {
    const list = siteData.tours || [];
    if (!searchTours.trim()) return list;
    const q = searchTours.toLowerCase();
    return list.filter(
      (item) =>
        (item.title || "").toLowerCase().includes(q) ||
        (item.tagline || "").toLowerCase().includes(q),
    );
  }, [siteData.tours, searchTours]);

  const filteredEnquiries = useMemo(() => {
    if (!searchEnquiries.trim()) return enquiries;
    const q = searchEnquiries.toLowerCase();
    return enquiries.filter(
      (enq) =>
        (enq.fullName || "").toLowerCase().includes(q) ||
        (enq.email || "").toLowerCase().includes(q) ||
        (enq.serviceRequired || "").toLowerCase().includes(q),
    );
  }, [enquiries, searchEnquiries]);

  // Tab Header Details
  const tabTitles = {
    dashboard: {
      title: "Dashboard Overview",
      desc: "Real-time website management for Air Dream Travel Tourism LLC",
    },
    wallpapers: {
      title: "Home Wallpapers & Hero Slides",
      desc: "Customize the full-screen background wallpapers, titles, badges, and action buttons",
    },
    whyChooseUs: {
      title: "Why Choose Us / Feature Cards",
      desc: "Customize the feature cards (Tour Guide, Friendly Price, Reliable Tour, 24/7 Support) with pictures, badges, and pricing",
    },
    attractions: {
      title: "Recommended Attractions",
      desc: "Edit or add Dubai landmarks, activities count, entry ticket prices, and photos",
    },
    gallery: {
      title: "Photo Gallery",
      desc: "Upload photos from your computer or paste image links to show in the photo gallery",
    },
    tours: {
      title: "Attractions - Ticket",
      desc: "Manage tour itineraries, duration, 4WD vehicles, driver-guide, prices, and bookings",
    },
    holidayPackages: {
      title: "Special Holiday Packages",
      desc: "Manage 6-card Special Holiday packages carousel, itineraries, prices, vehicles, and guides",
    },
    transfers: {
      title: "Airport Transfers",
      desc: "Manage fleet vehicles (Land Cruiser, Prado, Altima, V-Class), passenger & luggage capacity, fares",
    },
    packages: {
      title: "Featured & Umrah Packages",
      desc: "Manage 5-Star Executive Umrah, Swiss Alps, Bali villas, Tokyo tours with inclusions & prices",
    },
    reviews: {
      title: "Traveler Reviews & Testimonials",
      desc: "Add customer feedback, ratings, and quotes (e.g., Bhavesh S, Sarah M.)",
    },
    enquiries: {
      title: "Customer Booking Inquiries",
      desc: "View, filter, and manage real-time quote and booking requests submitted by visitors",
    },
    settings: {
      title: "Site Settings & Contact Info",
      desc: "Edit brand logo, phone, WhatsApp, email, office address, and About Us photos",
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.dashboard;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            zIndex: 99,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ======================================================================
           SIDEBAR
           ====================================================================== */}
      <aside
        className={`admin-sidebar ${mobileMenuOpen ? "open" : ""}`}
        style={{ transform: mobileMenuOpen ? "translateX(0)" : undefined }}
      >
        <div className="sidebar-header">
          <Link
            to="/"
            className="sidebar-brand-logo-wrap"
            title="View Air Dream Live Site"
            style={{ textDecoration: "none" }}
          >
            <img
              src={siteData.settings?.logoUrl || "/assets/air-dream-logo.png"}
              alt="AIR DREAM Logo"
              className="admin-navbar-logo"
              id="adminSidebarLogo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/air-dream-logo.png";
              }}
            />
            <div className="air-dream-brand-text">
              <span className="air-dream-brand-name">AIR DREAM</span>
              <div className="air-dream-brand-sub-wrap">
                <span className="air-dream-brand-sub">TRAVEL TOURISM</span>
                <span className="air-dream-brand-llc">LLC</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          <button
            type="button"
            className={`sidebar-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("dashboard");
              setMobileMenuOpen(false);
            }}
          >
            <span className="tab-btn-content">
              <i className="fa-solid fa-gauge-high"></i> Dashboard
            </span>
          </button>

          <div className="nav-section-label">Content Management</div>

          <button
            type="button"
            className={`sidebar-tab-btn ${activeTab === "wallpapers" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("wallpapers");
              setMobileMenuOpen(false);
            }}
          >
            <span className="tab-btn-content">
              <i className="fa-solid fa-images"></i> Home Wallpapers
            </span>
            <span className="tab-badge">
              {siteData.wallpapers?.length || 0}
            </span>
          </button>

          <button
            type="button"
            className={`sidebar-tab-btn ${activeTab === "whyChooseUs" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("whyChooseUs");
              setMobileMenuOpen(false);
            }}
          >
            <span className="tab-btn-content">
              <i className="fa-solid fa-wand-magic-sparkles"></i> Feature Cards
            </span>
            <span className="tab-badge">
              {siteData.whyChooseUs?.length || 0}
            </span>
          </button>

          <button
            type="button"
            className={`sidebar-tab-btn ${activeTab === "attractions" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("attractions");
              setMobileMenuOpen(false);
            }}
          >
            <span className="tab-btn-content">
              <i className="fa-solid fa-landmark"></i> Dubai Attractions
            </span>
            <span className="tab-badge">
              {siteData.attractions?.length || 0}
            </span>
          </button>

          <button
            type="button"
            className={`sidebar-tab-btn ${activeTab === "gallery" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("gallery");
              setMobileMenuOpen(false);
            }}
          >
            <span className="tab-btn-content">
              <i className="fa-solid fa-camera"></i> Photo Gallery
            </span>
            <span className="tab-badge">{siteData.gallery?.length || 0}</span>
          </button>

          <button
            type="button"
            className={`sidebar-tab-btn ${activeTab === "tours" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("tours");
              setMobileMenuOpen(false);
            }}
          >
            <span className="tab-btn-content">
              <i className="fa-solid fa-mountain-sun"></i> Attractions - Ticket
            </span>
            <span className="tab-badge">{siteData.tours?.length || 0}</span>
          </button>

          <button
            type="button"
            className={`sidebar-tab-btn ${activeTab === "holidayPackages" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("holidayPackages");
              setMobileMenuOpen(false);
            }}
          >
            <span className="tab-btn-content">
              <i className="fa-solid fa-umbrella-beach"></i> Special Holiday
            </span>
            <span className="tab-badge">{siteData.holidayPackages?.length || 0}</span>
          </button>

          <button
            type="button"
            className={`sidebar-tab-btn ${activeTab === "transfers" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("transfers");
              setMobileMenuOpen(false);
            }}
          >
            <span className="tab-btn-content">
              <i className="fa-solid fa-car-side"></i> Airport Transfers
            </span>
            <span className="tab-badge">{siteData.transfers?.length || 0}</span>
          </button>

          <button
            type="button"
            className={`sidebar-tab-btn ${activeTab === "packages" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("packages");
              setMobileMenuOpen(false);
            }}
          >
            <span className="tab-btn-content">
              <i className="fa-solid fa-box-archive"></i> Packages
            </span>
            <span className="tab-badge">{siteData.packages?.length || 0}</span>
          </button>

          <button
            type="button"
            className={`sidebar-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("reviews");
              setMobileMenuOpen(false);
            }}
          >
            <span className="tab-btn-content">
              <i className="fa-solid fa-comments"></i> Traveler Reviews
            </span>
            <span className="tab-badge">{siteData.reviews?.length || 0}</span>
          </button>

          <div className="nav-section-label">Communications</div>
          <button
            type="button"
            className={`sidebar-tab-btn ${activeTab === "enquiries" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("enquiries");
              setMobileMenuOpen(false);
            }}
          >
            <span className="tab-btn-content">
              <i className="fa-solid fa-envelope-open-text"></i> Customer
              Inquiries
            </span>
            <span
              className="tab-badge"
              style={{ background: "#f59e0b", color: "#fff" }}
            >
              {enquiries.length}
            </span>
          </button>

          <div className="nav-section-label">Configuration</div>
          <button
            type="button"
            className={`sidebar-tab-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("settings");
              setMobileMenuOpen(false);
            }}
          >
            <span className="tab-btn-content">
              <i className="fa-solid fa-sliders"></i> Site Settings
            </span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="live-indicator">
            <div className="pulse-dot"></div>
            <span>Live Sync Active</span>
          </div>
        </div>
      </aside>

      {/* ======================================================================
           MAIN CONTENT
           ====================================================================== */}
      <main className="admin-main">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <div className="topbar-title">
              <h1>{currentTabInfo.title}</h1>
              <p>{currentTabInfo.desc}</p>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Admin Badge */}
            <span
              className="btn-admin"
              style={{
                background: "#e0f2fe",
                color: "#0369a1",
                border: "none",
                cursor: "default",
              }}
              title="Authorized Administrator Email"
            >
              <i className="fa-solid fa-circle-user"></i>
              <span className="btn-text-hide">
                Admin: {user?.email || "admin@airdream.com"}
              </span>
            </span>

            {/* Live Website Link */}
            <Link
              to="/"
              target="_blank"
              className="btn-admin btn-admin-primary"
              title="Open Website"
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
              <span className="btn-text-hide">Live Website</span>
            </Link>

            {/* Export JSON */}
            <button
              type="button"
              className="btn-admin btn-admin-outline"
              onClick={handleExportJSON}
              title="Download backup JSON"
            >
              <i className="fa-solid fa-download"></i>
              <span className="btn-text-hide">Export JSON</span>
            </button>

            {/* Import JSON */}
            <label
              className="btn-admin btn-admin-outline"
              title="Import backup JSON"
              style={{ cursor: "pointer", marginBottom: 0 }}
            >
              <i className="fa-solid fa-upload"></i>
              <span className="btn-text-hide">Import JSON</span>
              <input
                type="file"
                ref={importFileRef}
                accept=".json"
                style={{ display: "none" }}
                onChange={handleImportJSON}
              />
            </label>

            {/* Reset Defaults */}
            <button
              type="button"
              className="btn-admin btn-admin-danger-outline"
              onClick={handleResetDefaults}
              title="Reset to initial factory defaults"
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>

            {/* Logout */}
            <button
              type="button"
              className="btn-admin btn-admin-danger-outline"
              onClick={handleLogout}
              title="Log out from Admin Hub"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="btn-text-hide">Logout</span>
            </button>
          </div>
        </header>

        {/* ====================================================================
             VIEWS WRAPPER
             ==================================================================== */}
        <div className="admin-view-content">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <section className="tab-pane active" id="pane-dashboard">
              <div className="dashboard-banner">
                <div className="banner-text">
                  <h2>Welcome to Air Dream Admin Portal</h2>
                  <p>
                    Every single section of your website is 100% editable in
                    real time. Any changes or new items you add are immediately
                    visible across your live site and mobile view.
                  </p>
                </div>
                <div className="banner-actions">
                  <button
                    type="button"
                    className="btn-admin btn-admin-success"
                    onClick={() => openAddModal("attraction")}
                  >
                    <i className="fa-solid fa-plus"></i> Add Dubai Attraction
                  </button>
                  <button
                    type="button"
                    className="btn-admin btn-admin-outline"
                    style={{ background: "#fff", color: "#0f172a" }}
                    onClick={() => openAddModal("gallery")}
                  >
                    <i className="fa-solid fa-camera"></i> Add Photo
                  </button>
                </div>
              </div>

              {/* STATS CARDS */}
              <div className="stats-grid">
                <div
                  className="stat-card"
                  onClick={() => setActiveTab("wallpapers")}
                >
                  <div className="stat-icon blue">
                    <i className="fa-solid fa-images"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{siteData.wallpapers?.length || 0}</h3>
                    <p>Home Wallpapers</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  onClick={() => setActiveTab("whyChooseUs")}
                >
                  <div className="stat-icon purple">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{siteData.whyChooseUs?.length || 0}</h3>
                    <p>Why Choose Us</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  onClick={() => setActiveTab("attractions")}
                >
                  <div className="stat-icon teal">
                    <i className="fa-solid fa-landmark"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{siteData.attractions?.length || 0}</h3>
                    <p>Dubai Attractions</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  onClick={() => setActiveTab("gallery")}
                >
                  <div className="stat-icon purple">
                    <i className="fa-solid fa-camera"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{siteData.gallery?.length || 0}</h3>
                    <p>Gallery Photos</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  onClick={() => setActiveTab("tours")}
                >
                  <div className="stat-icon gold">
                    <i className="fa-solid fa-mountain-sun"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{siteData.tours?.length || 0}</h3>
                    <p>Attractions - Ticket</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  onClick={() => setActiveTab("transfers")}
                >
                  <div className="stat-icon green">
                    <i className="fa-solid fa-car-side"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{siteData.transfers?.length || 0}</h3>
                    <p>Airport Transfers</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  onClick={() => setActiveTab("packages")}
                >
                  <div className="stat-icon pink">
                    <i className="fa-solid fa-box-archive"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{siteData.packages?.length || 0}</h3>
                    <p>Umrah &amp; Packages</p>
                  </div>
                </div>
              </div>

              {/* FAST ADD SHORTCUTS */}
              <div className="quick-actions-bar" style={{ marginTop: "24px" }}>
                <h3>
                  <i className="fa-solid fa-bolt text-gold"></i> Fast Add
                  Shortcuts
                </h3>
                <div className="quick-actions-grid">
                  <button
                    type="button"
                    className="btn-admin btn-admin-outline"
                    onClick={() => openAddModal("wallpaper")}
                  >
                    <i className="fa-solid fa-plus text-primary"></i> Add Hero
                    Wallpaper
                  </button>
                  <button
                    type="button"
                    className="btn-admin btn-admin-outline"
                    onClick={() => openAddModal("whyChooseUs")}
                  >
                    <i className="fa-solid fa-plus text-purple"></i> Add Feature
                    Card
                  </button>
                  <button
                    type="button"
                    className="btn-admin btn-admin-outline"
                    onClick={() => openAddModal("attraction")}
                  >
                    <i className="fa-solid fa-plus text-teal"></i> Add Dubai
                    Attraction
                  </button>
                  <button
                    type="button"
                    className="btn-admin btn-admin-outline"
                    onClick={() => openAddModal("gallery")}
                  >
                    <i className="fa-solid fa-plus text-purple"></i> Add Gallery
                    Picture
                  </button>
                  <button
                    type="button"
                    className="btn-admin btn-admin-outline"
                    onClick={() => openAddModal("tour")}
                  >
                    <i className="fa-solid fa-plus text-gold"></i> Add Tour
                    Package
                  </button>
                  <button
                    type="button"
                    className="btn-admin btn-admin-outline"
                    onClick={() => openAddModal("holidayPackage")}
                  >
                    <i className="fa-solid fa-plus text-primary"></i> Add Special Holiday
                  </button>
                  <button
                    type="button"
                    className="btn-admin btn-admin-outline"
                    onClick={() => openAddModal("transfer")}
                  >
                    <i className="fa-solid fa-plus text-green"></i> Add Airport
                    Transfer
                  </button>
                  <button
                    type="button"
                    className="btn-admin btn-admin-outline"
                    onClick={() => openAddModal("package")}
                  >
                    <i className="fa-solid fa-plus text-pink"></i> Add Umrah /
                    Holiday
                  </button>
                  <button
                    type="button"
                    className="btn-admin btn-admin-outline"
                    onClick={() => openAddModal("review")}
                  >
                    <i className="fa-solid fa-plus text-warning"></i> Add Review
                  </button>
                </div>
              </div>

              {/* RECENT INQUIRIES PREVIEW */}
              <div
                style={{
                  marginTop: "30px",
                  background: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    <i
                      className="fa-solid fa-envelope-open-text text-primary"
                      style={{ marginRight: "8px" }}
                    ></i>
                    Recent Booking &amp; Quote Requests ({enquiries.length})
                  </h3>
                  <button
                    type="button"
                    className="btn-admin btn-admin-outline"
                    style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                    onClick={() => setActiveTab("enquiries")}
                  >
                    View All Inquiries →
                  </button>
                </div>

                {enquiries.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
                    No customer inquiries received yet.
                  </p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                        fontSize: "0.85rem",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: "2px solid #e2e8f0",
                            color: "#475569",
                          }}
                        >
                          <th style={{ padding: "10px" }}>Customer</th>
                          <th style={{ padding: "10px" }}>Contact</th>
                          <th style={{ padding: "10px" }}>Service / Trip</th>
                          <th style={{ padding: "10px" }}>Date</th>
                          <th style={{ padding: "10px" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enquiries.slice(0, 5).map((enq) => (
                          <tr
                            key={enq._id || enq.id}
                            style={{ borderBottom: "1px solid #f1f5f9" }}
                          >
                            <td
                              style={{
                                padding: "12px 10px",
                                fontWeight: 600,
                                color: "#0f172a",
                              }}
                            >
                              {enq.fullName}
                            </td>
                            <td
                              style={{ padding: "12px 10px", color: "#64748b" }}
                            >
                              <div>{enq.email}</div>
                              <div style={{ fontSize: "0.78rem" }}>
                                {enq.phone}
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "12px 10px",
                                color: "#0284c7",
                                fontWeight: 500,
                              }}
                            >
                              {enq.serviceRequired ||
                                enq.destination ||
                                "Custom Booking"}
                            </td>
                            <td
                              style={{
                                padding: "12px 10px",
                                color: "#64748b",
                                fontSize: "0.8rem",
                              }}
                            >
                              {new Date(
                                enq.createdAt || Date.now(),
                              ).toLocaleDateString()}
                            </td>
                            <td style={{ padding: "12px 10px" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "3px 8px",
                                  borderRadius: "999px",
                                  fontSize: "0.72rem",
                                  fontWeight: 600,
                                  backgroundColor: enq.isRead
                                    ? "#e2e8f0"
                                    : "#dcfce7",
                                  color: enq.isRead ? "#475569" : "#15803d",
                                }}
                              >
                                {enq.isRead ? "Reviewed" : "New"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 2: WALLPAPERS */}
          {activeTab === "wallpapers" && (
            <section className="tab-pane active" id="pane-wallpapers">
              <div className="view-header">
                <div className="view-header-title">
                  <h2>
                    <i className="fa-solid fa-images text-primary"></i> Home
                    Wallpapers &amp; Hero Slides
                  </h2>
                  <p>
                    Customize the full-screen background wallpapers, titles,
                    badges, and action buttons
                  </p>
                </div>
                <div className="view-header-actions">
                  <button
                    type="button"
                    className="btn-admin btn-admin-primary"
                    onClick={() => openAddModal("wallpaper")}
                  >
                    <i className="fa-solid fa-plus"></i> Add New Slide
                  </button>
                </div>
              </div>

              <div className="items-grid">
                {(siteData.wallpapers || []).map((slide) => {
                  const id = slide.id || slide._id;
                  return (
                    <div className="item-card" key={id}>
                      <div className="item-card-image">
                        <img src={slide.image} alt={slide.title} />
                        <span className="item-badge-pill">
                          <i
                            className={`fa-solid ${slide.badgeIcon || "fa-star"}`}
                            style={{ marginRight: "4px" }}
                          ></i>
                          {slide.badge}
                        </span>
                      </div>
                      <div className="item-card-body">
                        <h4 className="item-card-title">
                          {slide.title} {slide.highlight}
                        </h4>
                        <p
                          className="item-card-sub"
                          style={{ fontSize: "0.82rem", lineHeight: "1.4" }}
                        >
                          {slide.desc}
                        </p>
                        <div className="item-features-list">
                          <span className="feature-pill">
                            <i className="fa-solid fa-link"></i>{" "}
                            {slide.primaryBtnText}
                          </span>
                          {slide.secondaryBtnText && (
                            <span className="feature-pill">
                              <i className="fa-solid fa-phone"></i>{" "}
                              {slide.secondaryBtnText}
                            </span>
                          )}
                        </div>
                        <div className="item-card-actions">
                          <button
                            type="button"
                            className="btn-card-action btn-edit"
                            onClick={() => openEditModal("wallpaper", slide)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-card-action btn-delete"
                            onClick={() =>
                              handleDeleteItem("wallpapers", id, slide.title)
                            }
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB: WHY CHOOSE US / FEATURE CARDS */}
          {activeTab === "whyChooseUs" && (
            <section className="tab-pane active" id="pane-why-choose-us">
              <div className="view-header">
                <div className="view-header-title">
                  <h2>
                    <i className="fa-solid fa-wand-magic-sparkles text-primary"></i>{" "}
                    Why Choose Us / Feature Cards
                  </h2>
                  <p>
                    Customize the 4 highlight feature cards with picture, icon,
                    badge, price, and description
                  </p>
                </div>
                <div className="view-header-actions">
                  <button
                    type="button"
                    className="btn-admin btn-admin-primary"
                    onClick={() => openAddModal("whyChooseUs")}
                  >
                    <i className="fa-solid fa-plus"></i> Add Feature Card
                  </button>
                </div>
              </div>

              <div className="items-grid">
                {(siteData.whyChooseUs || []).map((card) => {
                  const id = card.id || card._id;
                  const cardImg =
                    card.image ||
                    card.img ||
                    card.fallback ||
                    "/assets/cards/card1.png";
                  return (
                    <div className="item-card" key={id}>
                      <div className="item-card-image">
                        <img
                          src={cardImg}
                          alt={card.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              card.fallback || "/assets/cards/card1.png";
                          }}
                        />
                        {card.badge && (
                          <span className="item-badge-pill">
                            <i
                              className="fa-solid fa-star"
                              style={{ marginRight: "4px" }}
                            ></i>
                            {card.badge}
                          </span>
                        )}
                        {card.price && (
                          <span className="item-price-tag">{card.price}</span>
                        )}
                      </div>
                      <div className="item-card-body">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              background: "rgba(0, 75, 135, 0.1)",
                              color: "#004b87",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.1rem",
                              flexShrink: 0,
                            }}
                          >
                            {card.icon && card.icon.startsWith("fa-") ? (
                              <i className={card.icon}></i>
                            ) : (
                              <span>{card.icon || "✈️"}</span>
                            )}
                          </span>
                          <h4
                            className="item-card-title"
                            style={{ margin: 0, fontSize: "1.05rem" }}
                          >
                            {card.title}
                          </h4>
                        </div>
                        <p
                          className="item-card-sub"
                          style={{
                            fontSize: "0.85rem",
                            lineHeight: "1.45",
                            color: "#475569",
                            marginBottom: "14px",
                          }}
                        >
                          {card.description || card.desc}
                        </p>
                        <div className="item-card-actions">
                          <button
                            type="button"
                            className="btn-card-action btn-edit"
                            onClick={() => openEditModal("whyChooseUs", card)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-card-action btn-delete"
                            onClick={() =>
                              handleDeleteItem("whyChooseUs", id, card.title)
                            }
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB 3: ATTRACTIONS */}
          {activeTab === "attractions" && (
            <section className="tab-pane active" id="pane-attractions">
              <div className="view-header">
                <div className="view-header-title">
                  <h2>
                    <i className="fa-solid fa-landmark text-teal"></i> Recommended Attractions
                  </h2>
                  <p>
                    Edit or add Dubai landmarks, activities count, entry ticket
                    prices, and photos
                  </p>
                </div>
                <div className="view-header-actions">
                  <div className="admin-search-wrap">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder="Search attractions..."
                      value={searchAttractions}
                      onChange={(e) => setSearchAttractions(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-admin btn-admin-primary"
                    onClick={() => openAddModal("attraction")}
                  >
                    <i className="fa-solid fa-plus"></i> Add Attraction
                  </button>
                </div>
              </div>

              <div className="items-grid">
                {filteredAttractions.map((att) => {
                  const id = att.id || att._id;
                  return (
                    <div className="item-card" key={id}>
                      <div className="item-card-image">
                        <img src={att.image} alt={att.name} />
                        <span className="item-price-tag">{att.price}</span>
                      </div>
                      <div className="item-card-body">
                        <h4 className="item-card-title">{att.name}</h4>
                        <div className="item-card-sub">
                          <i className="fa-solid fa-ticket text-teal"></i>{" "}
                          {att.activities}
                        </div>
                        <div className="item-card-actions">
                          <button
                            type="button"
                            className="btn-card-action btn-edit"
                            onClick={() => openEditModal("attraction", att)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-card-action btn-delete"
                            onClick={() =>
                              handleDeleteItem("attractions", id, att.name)
                            }
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB 4: GALLERY */}
          {activeTab === "gallery" && (
            <section className="tab-pane active" id="pane-gallery">
              <div className="view-header">
                <div className="view-header-title">
                  <h2>
                    <i className="fa-solid fa-camera text-purple"></i> Photo
                    Gallery
                  </h2>
                  <p>
                    Upload photos from your computer or paste image links to
                    show in the photo gallery
                  </p>
                </div>
                <div className="view-header-actions">
                  <button
                    type="button"
                    className="btn-admin btn-admin-primary"
                    onClick={() => openAddModal("gallery")}
                  >
                    <i className="fa-solid fa-plus"></i> Add Picture
                  </button>
                </div>
              </div>

              <div className="items-grid">
                {(siteData.gallery || []).map((pic) => {
                  const id = pic.id || pic._id;
                  return (
                    <div className="item-card" key={id}>
                      <div className="item-card-image">
                        <img src={pic.image} alt={pic.title} />
                      </div>
                      <div className="item-card-body">
                        <h4 className="item-card-title">{pic.title}</h4>
                        <div className="item-card-sub">
                          <i className="fa-solid fa-location-dot text-purple"></i>{" "}
                          {pic.location}
                        </div>
                        <div className="item-card-actions">
                          <button
                            type="button"
                            className="btn-card-action btn-edit"
                            onClick={() => openEditModal("gallery", pic)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-card-action btn-delete"
                            onClick={() =>
                              handleDeleteItem("gallery", id, pic.title)
                            }
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB 5: TOURS */}
          {activeTab === "tours" && (
            <section className="tab-pane active" id="pane-tours">
              <div className="view-header">
                <div className="view-header-title">
                  <h2>
                    <i className="fa-solid fa-mountain-sun text-gold"></i> Attractions - Ticket
                  </h2>
                  <p>
                    Manage tour itineraries, duration, 4WD vehicles,
                    driver-guide, prices, and bookings
                  </p>
                </div>
                <div className="view-header-actions">
                  <div className="admin-search-wrap">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder="Search tours..."
                      value={searchTours}
                      onChange={(e) => setSearchTours(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-admin btn-admin-primary"
                    onClick={() => openAddModal("tour")}
                  >
                    <i className="fa-solid fa-plus"></i> Add Tour Package
                  </button>
                </div>
              </div>

              <div className="items-grid">
                {filteredTours.map((tour) => {
                  const id = tour.id || tour._id;
                  return (
                    <div className="item-card" key={id}>
                      <div className="item-card-image">
                        <img src={tour.image} alt={tour.title} />
                        <span className="item-price-tag">{tour.price}</span>
                        <span
                          className="item-badge-pill"
                          style={{ left: "auto", right: "10px" }}
                        >
                          <i
                            className="fa-solid fa-star text-gold"
                            style={{ marginRight: "4px" }}
                          ></i>{" "}
                          {tour.rating || 5}
                        </span>
                      </div>
                      <div className="item-card-body">
                        <h4 className="item-card-title">{tour.title}</h4>
                        <div className="item-card-sub">{tour.location || tour.tagline || "Dubai, UAE"}</div>
                        <div className="item-features-list">
                          <span className="feature-pill">
                            <i className="fa-regular fa-clock"></i>{" "}
                            {tour.duration || tour.hours || "08-Hrs"}
                          </span>
                          <span className="feature-pill">
                            <i className="fa-solid fa-car"></i>{" "}
                            {tour.vehicle || tour.carHours || "4WD Cruiser"}
                          </span>
                          <span className="feature-pill">
                            <i className="fa-solid fa-user-tie"></i>{" "}
                            {tour.guide || "Driver-guide"}
                          </span>
                          <span className="feature-pill">
                            <i className="fa-solid fa-users"></i>{" "}
                            {tour.capacity || tour.groupSize || "4 Persons"}
                          </span>
                        </div>
                        <div className="item-card-actions">
                          <button
                            type="button"
                            className="btn-card-action btn-edit"
                            onClick={() => openEditModal("tour", tour)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-card-action btn-delete"
                            onClick={() =>
                              handleDeleteItem("tours", id, tour.title)
                            }
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB: SPECIAL HOLIDAY PACKAGES */}
          {activeTab === "holidayPackages" && (
            <section className="tab-pane active" id="pane-holiday-packages">
              <div className="view-header">
                <div className="view-header-title">
                  <h2>
                    <i className="fa-solid fa-umbrella-beach text-gold"></i> Special Holiday Packages
                  </h2>
                  <p>
                    Manage 6-card Special Holiday packages carousel, itineraries, prices, vehicles, and guides
                  </p>
                </div>
                <div className="view-header-actions">
                  <div className="admin-search-wrap">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder="Search special holiday packages..."
                      value={searchHolidayPackages}
                      onChange={(e) => setSearchHolidayPackages(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-admin btn-admin-primary"
                    onClick={() => openAddModal("holidayPackage")}
                  >
                    <i className="fa-solid fa-plus"></i> Add Special Holiday
                  </button>
                </div>
              </div>

              <div className="items-grid">
                {filteredHolidayPackages.map((pkg) => {
                  const id = pkg.id || pkg._id;
                  return (
                    <div className="item-card" key={id}>
                      <div className="item-card-image">
                        <img src={pkg.image} alt={pkg.title} />
                        <span className="item-price-tag">{pkg.price}</span>
                        <span
                          className="item-badge-pill"
                          style={{ left: "auto", right: "10px" }}
                        >
                          <i
                            className="fa-solid fa-star text-gold"
                            style={{ marginRight: "4px" }}
                          ></i>{" "}
                          {pkg.rating || 5}
                        </span>
                      </div>
                      <div className="item-card-body">
                        <h4 className="item-card-title">{pkg.title}</h4>
                        <div className="item-card-sub">{pkg.location || pkg.tagline || "Dubai, UAE"}</div>
                        <div className="item-features-list">
                          <span className="feature-pill">
                            <i className="fa-regular fa-clock"></i>{" "}
                            {pkg.duration || pkg.hours || "Full Day"}
                          </span>
                          <span className="feature-pill">
                            <i className="fa-solid fa-car"></i>{" "}
                            {pkg.vehicle || pkg.carHours || "Luxury Sprinter"}
                          </span>
                          <span className="feature-pill">
                            <i className="fa-solid fa-user-tie"></i>{" "}
                            {pkg.guide || "Park Concierge"}
                          </span>
                          <span className="feature-pill">
                            <i className="fa-solid fa-users"></i>{" "}
                            {pkg.capacity || pkg.groupSize || "2–8 Guests"}
                          </span>
                        </div>
                        <div className="item-card-actions">
                          <button
                            type="button"
                            className="btn-card-action btn-edit"
                            onClick={() => openEditModal("holidayPackage", pkg)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-card-action btn-delete"
                            onClick={() =>
                              handleDeleteItem("holidayPackages", id, pkg.title)
                            }
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB 6: AIRPORT TRANSFERS */}
          {activeTab === "transfers" && (
            <section className="tab-pane active" id="pane-transfers">
              <div className="view-header">
                <div className="view-header-title">
                  <h2>
                    <i className="fa-solid fa-car-side text-green"></i> Airport
                    Transfers
                  </h2>
                  <p>
                    Manage fleet vehicles (Land Cruiser, Prado, Altima,
                    V-Class), passenger &amp; luggage capacity, fares
                  </p>
                </div>
                <div className="view-header-actions">
                  <button
                    type="button"
                    className="btn-admin btn-admin-primary"
                    onClick={() => openAddModal("transfer")}
                  >
                    <i className="fa-solid fa-plus"></i> Add Vehicle Transfer
                  </button>
                </div>
              </div>

              <div className="items-grid">
                {(siteData.transfers || []).map((tr) => {
                  const id = tr.id || tr._id;
                  return (
                    <div className="item-card" key={id}>
                      <div className="item-card-image">
                        <img src={tr.image} alt={tr.title} />
                        <span className="item-price-tag">{tr.price}</span>
                        <span className="item-badge-pill">{tr.category}</span>
                      </div>
                      <div className="item-card-body">
                        <h4 className="item-card-title">{tr.title}</h4>
                        <div
                          className="item-features-list"
                          style={{ marginTop: "6px" }}
                        >
                          <span className="feature-pill">
                            <i className="fa-solid fa-users"></i>{" "}
                            {tr.passengers} Passengers
                          </span>
                          <span className="feature-pill">
                            <i className="fa-solid fa-suitcase"></i>{" "}
                            {tr.luggage} Luggage
                          </span>
                        </div>
                        <div className="item-card-actions">
                          <button
                            type="button"
                            className="btn-card-action btn-edit"
                            onClick={() => openEditModal("transfer", tr)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-card-action btn-delete"
                            onClick={() =>
                              handleDeleteItem("transfers", id, tr.title)
                            }
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB 7: PACKAGES */}
          {activeTab === "packages" && (
            <section className="tab-pane active" id="pane-packages">
              <div className="view-header">
                <div className="view-header-title">
                  <h2>
                    <i className="fa-solid fa-box-archive text-pink"></i>{" "}
                    Featured &amp; Umrah Packages
                  </h2>
                  <p>
                    Manage 5-Star Executive Umrah, Swiss Alps, Bali villas,
                    Tokyo tours with inclusions &amp; prices
                  </p>
                </div>
                <div className="view-header-actions">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        background: "rgba(245, 158, 11, 0.15)",
                        color: "#f59e0b",
                        fontWeight: 700,
                        border: "1px solid rgba(245, 158, 11, 0.35)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="fa-solid fa-star"></i>
                      {(siteData.packages || []).filter((p) => p.featured || p.isFeatured).length} Featured
                    </span>
                    <button
                      type="button"
                      className="btn-admin btn-admin-primary"
                      onClick={() => openAddModal("package")}
                    >
                      <i className="fa-solid fa-plus"></i> Add Package
                    </button>
                  </div>
                </div>
              </div>

              <div className="items-grid">
                {(siteData.packages || []).map((pkg) => {
                  const id = pkg.id || pkg._id;
                  const isFeat = Boolean(pkg.featured || pkg.isFeatured);
                  return (
                    <div
                      className={`item-card ${isFeat ? "package-item-featured" : ""}`}
                      key={id}
                      style={{
                        position: "relative",
                        borderColor: isFeat ? "#f59e0b" : undefined,
                        boxShadow: isFeat ? "0 4px 18px rgba(245, 158, 11, 0.2)" : undefined,
                      }}
                    >
                      <div className="item-card-image">
                        <img src={pkg.image} alt={pkg.title} />
                        <span className="item-price-tag">{pkg.price}</span>
                        {pkg.badge && (
                          <span className="item-badge-pill">{pkg.badge}</span>
                        )}
                        {isFeat && (
                          <span
                            className="item-featured-tag"
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              background: "linear-gradient(135deg, #f59e0b, #d97706)",
                              color: "#fff",
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: "20px",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              letterSpacing: "0.4px",
                              textTransform: "uppercase",
                              zIndex: 3,
                            }}
                          >
                            <i className="fa-solid fa-star"></i> Featured
                          </span>
                        )}
                      </div>
                      <div className="item-card-body">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              textTransform: "uppercase",
                              fontWeight: 700,
                              color: "#0284c7",
                            }}
                          >
                            {pkg.category === "umrah"
                              ? "Hajj & Umrah"
                              : pkg.category === "flights"
                              ? "Flights"
                              : "Holiday Tour"}
                          </span>
                          {isFeat ? (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#f59e0b",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <i className="fa-solid fa-star"></i> Featured Active
                            </span>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                              Standard
                            </span>
                          )}
                        </div>
                        <h4 className="item-card-title">{pkg.title}</h4>
                        <div className="item-card-sub">
                          <i className="fa-regular fa-clock"></i> {pkg.duration}
                        </div>
                        <div className="item-features-list">
                          {(pkg.inclusions || [])
                            .slice(0, 3)
                            .map((inc, idx) => (
                              <span className="feature-pill" key={idx}>
                                <i className="fa-solid fa-circle-check text-success"></i>{" "}
                                {typeof inc === "object" ? inc.text : inc}
                              </span>
                            ))}
                        </div>
                        <div className="item-card-actions">
                          <button
                            type="button"
                            className={`btn-card-action ${isFeat ? "btn-feature-active" : "btn-feature-toggle"}`}
                            onClick={() => handleTogglePackageFeatured(id, !isFeat)}
                            title={isFeat ? "Click to unmark as featured" : "Click to mark as featured"}
                          >
                            <i className={`fa-${isFeat ? "solid" : "regular"} fa-star`}></i>{" "}
                            {isFeat ? "Featured" : "Feature"}
                          </button>
                          <button
                            type="button"
                            className="btn-card-action btn-edit"
                            onClick={() => openEditModal("package", pkg)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-card-action btn-delete"
                            onClick={() =>
                              handleDeleteItem("packages", id, pkg.title)
                            }
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB 8: REVIEWS */}
          {activeTab === "reviews" && (
            <section className="tab-pane active" id="pane-reviews">
              <div className="view-header">
                <div className="view-header-title">
                  <h2>
                    <i className="fa-solid fa-comments text-warning"></i>{" "}
                    Traveler Reviews &amp; Testimonials
                  </h2>
                  <p>
                    Add customer feedback, ratings, and quotes (e.g., Bhavesh S,
                    Sarah M.)
                  </p>
                </div>
                <div className="view-header-actions">
                  <button
                    type="button"
                    className="btn-admin btn-admin-primary"
                    onClick={() => openAddModal("review")}
                  >
                    <i className="fa-solid fa-plus"></i> Add Review
                  </button>
                </div>
              </div>

              <div className="reviews-grid">
                {(siteData.reviews || []).map((rev) => {
                  const id = rev.id || rev._id;
                  return (
                    <div className="review-admin-card" key={id}>
                      <div className="review-admin-header">
                        <div className="review-admin-avatar">
                          {rev.avatar ? (
                            <img
                              src={rev.avatar}
                              alt={rev.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "50%",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                background: "#004b87",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                              }}
                            >
                              {(rev.name || "A").charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="review-admin-meta">
                          <h4
                            style={{
                              margin: 0,
                              fontSize: "0.98rem",
                              fontWeight: 700,
                            }}
                          >
                            {rev.name}
                          </h4>
                          <div
                            style={{
                              color: "#f59e0b",
                              fontSize: "0.8rem",
                              marginTop: "4px",
                            }}
                          >
                            {Array.from({ length: rev.stars || 5 }).map(
                              (_, i) => (
                                <i key={i} className="fa-solid fa-star"></i>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                      <p
                        style={{
                          fontStyle: "italic",
                          color: "#334155",
                          fontSize: "0.88rem",
                          flex: 1,
                          margin: "12px 0",
                          lineHeight: "1.5",
                        }}
                      >
                        "{rev.quote}"
                      </p>
                      <div className="item-card-actions">
                        <button
                          type="button"
                          className="btn-card-action btn-edit"
                          onClick={() => openEditModal("review", rev)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn-card-action btn-delete"
                          onClick={() =>
                            handleDeleteItem("reviews", id, rev.name)
                          }
                        >
                          <i className="fa-solid fa-trash-can"></i> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB 9: ENQUIRIES */}
          {activeTab === "enquiries" && (
            <section className="tab-pane active" id="pane-enquiries">
              <div className="view-header">
                <div className="view-header-title">
                  <h2>
                    <i className="fa-solid fa-envelope-open-text text-primary"></i>{" "}
                    Customer Booking Inquiries
                  </h2>
                  <p>
                    Direct leads and quote submissions from website visitors via
                    BookingModal and QuoteModal
                  </p>
                </div>
                <div className="view-header-actions">
                  <div className="admin-search-wrap">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                      type="text"
                      className="admin-search-input"
                      placeholder="Search inquiries..."
                      value={searchEnquiries}
                      onChange={(e) => setSearchEnquiries(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-admin btn-admin-primary"
                    onClick={() => setIsAddEnquiryOpen(true)}
                  >
                    <i className="fa-solid fa-plus"></i> Add Inquiry
                  </button>
                  <button
                    type="button"
                    className="btn-admin btn-admin-outline"
                    onClick={fetchBackendEnquiries}
                  >
                    <i
                      className={`fa-solid fa-rotate-right ${loadingEnquiries ? "fa-spin" : ""}`}
                    ></i>{" "}
                    Refresh
                  </button>
                </div>
              </div>

              {filteredEnquiries.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <i
                    className="fa-regular fa-envelope-open"
                    style={{
                      fontSize: "3rem",
                      color: "#cbd5e1",
                      marginBottom: "14px",
                    }}
                  ></i>
                  <h3 style={{ fontSize: "1.2rem", color: "#475569" }}>
                    No inquiries matching your search
                  </h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                    New customer inquiries submitted on the live site will
                    appear here.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                        fontSize: "0.88rem",
                      }}
                    >
                      <thead
                        style={{
                          background: "#f8fafc",
                          borderBottom: "2px solid #e2e8f0",
                          color: "#475569",
                        }}
                      >
                        <tr>
                          <th style={{ padding: "14px 16px" }}>Status</th>
                          <th style={{ padding: "14px 16px" }}>
                            Customer Name
                          </th>
                          <th style={{ padding: "14px 16px" }}>
                            Phone &amp; Email
                          </th>
                          <th style={{ padding: "14px 16px" }}>
                            Trip / Service
                          </th>
                          <th style={{ padding: "14px 16px" }}>
                            Message / Details
                          </th>
                          <th style={{ padding: "14px 16px" }}>Received At</th>
                          <th
                            style={{
                              padding: "14px 16px",
                              textAlign: "center",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEnquiries.map((enq) => {
                          const id = enq._id || enq.id;
                          return (
                            <tr
                              key={id}
                              style={{
                                borderBottom: "1px solid #f1f5f9",
                                background: enq.isRead ? "#fff" : "#f0fdf4",
                              }}
                            >
                              <td style={{ padding: "14px 16px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 10px",
                                    borderRadius: "999px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    backgroundColor: enq.isRead
                                      ? "#e2e8f0"
                                      : "#22c55e",
                                    color: enq.isRead ? "#475569" : "#fff",
                                  }}
                                >
                                  {enq.isRead ? "Read" : "New Lead"}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: "14px 16px",
                                  fontWeight: 700,
                                  color: "#0f172a",
                                }}
                              >
                                {enq.fullName}
                              </td>
                              <td
                                style={{
                                  padding: "14px 16px",
                                  color: "#334155",
                                }}
                              >
                                <div>
                                  <i
                                    className="fa-solid fa-envelope text-primary"
                                    style={{ marginRight: "6px" }}
                                  ></i>
                                  {enq.email}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.82rem",
                                    color: "#64748b",
                                    marginTop: "4px",
                                  }}
                                >
                                  <i
                                    className="fa-solid fa-phone text-success"
                                    style={{ marginRight: "6px" }}
                                  ></i>
                                  {enq.phone}
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: "14px 16px",
                                  fontWeight: 600,
                                  color: "#004b87",
                                }}
                              >
                                {enq.serviceRequired ||
                                  enq.destination ||
                                  "General Enquiry"}
                              </td>
                              <td
                                style={{
                                  padding: "14px 16px",
                                  color: "#475569",
                                  maxWidth: "280px",
                                  lineHeight: "1.4",
                                }}
                              >
                                {enq.message || "No additional note provided."}
                              </td>
                              <td
                                style={{
                                  padding: "14px 16px",
                                  color: "#64748b",
                                  fontSize: "0.82rem",
                                }}
                              >
                                {new Date(
                                  enq.createdAt || Date.now(),
                                ).toLocaleString()}
                              </td>
                              <td
                                style={{
                                  padding: "14px 16px",
                                  textAlign: "center",
                                }}
                              >
                                <div
                                  style={{ display: "inline-flex", gap: "8px" }}
                                >
                                  <button
                                    type="button"
                                    className="btn-admin btn-admin-outline"
                                    style={{
                                      padding: "6px 10px",
                                      fontSize: "0.75rem",
                                    }}
                                    onClick={() =>
                                      handleToggleEnquiryRead(id, enq.isRead)
                                    }
                                    title={
                                      enq.isRead
                                        ? "Mark as Unread"
                                        : "Mark as Read"
                                    }
                                  >
                                    <i
                                      className={`fa-solid ${enq.isRead ? "fa-envelope-open" : "fa-check"}`}
                                    ></i>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-admin btn-admin-danger-outline"
                                    style={{
                                      padding: "6px 10px",
                                      fontSize: "0.75rem",
                                    }}
                                    onClick={() => handleDeleteEnquiry(id)}
                                    title="Delete inquiry"
                                  >
                                    <i className="fa-solid fa-trash-can"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === "settings" && (
            <section className="tab-pane active" id="pane-settings">
              <div className="view-header">
                <div className="view-header-title">
                  <h2>
                    <i className="fa-solid fa-sliders text-primary"></i> Site
                    Settings &amp; Contact Info
                  </h2>
                  <p>
                    Edit brand logo, phone, WhatsApp, email, office address, and
                    About Us photos
                  </p>
                </div>
                <div className="view-header-actions">
                  <button
                    type="button"
                    className="btn-action-save"
                    onClick={handleSaveSettings}
                    style={{ fontSize: "0.86rem", padding: "8px 18px" }}
                  >
                    <i className="fa-solid fa-check"></i> Save Changes
                  </button>
                </div>
              </div>

              <div className="settings-container">
                <form id="siteSettingsForm" onSubmit={handleSaveSettings}>
                  {/* BRAND LOGO */}
                  <h3 className="settings-section-title">
                    <i className="fa-solid fa-image"></i> Brand Logo (Used in
                    Navbar &amp; Header)
                  </h3>
                  <div className="form-field">
                    <label>Navbar Brand Logo Image URL or Upload</label>
                    <div className="image-input-group">
                      <div
                        className="image-preview-box"
                        style={{ height: "100px" }}
                      >
                        {settingsForm.logoUrl ? (
                          <img
                            src={settingsForm.logoUrl}
                            alt="Logo Preview"
                            style={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <span className="image-preview-placeholder">
                            <i className="fa-regular fa-image"></i> Logo Preview
                          </span>
                        )}
                      </div>
                      <div className="image-input-controls">
                        <input
                          type="text"
                          className="form-control"
                          value={settingsForm.logoUrl || ""}
                          placeholder="/assets/air-dream-badge.svg"
                          style={{ flex: 1 }}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              logoUrl: e.target.value,
                            })
                          }
                        />
                        <label className="file-upload-btn-label">
                          <i className="fa-solid fa-cloud-arrow-up"></i> Upload
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files && e.target.files[0];
                              if (file) {
                                handleSettingsFileUpload("logoUrl", file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* COMPANY IDENTITY */}
                  <h3 className="settings-section-title">
                    <i className="fa-solid fa-building"></i> Company Identity
                  </h3>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Brand Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settingsForm.brandName || ""}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            brandName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Brand Tagline</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settingsForm.brandTagline || ""}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            brandTagline: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* CONTACT DETAILS */}
                  <h3 className="settings-section-title">
                    <i className="fa-solid fa-phone"></i> Contact Details
                  </h3>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Phone Number (Display)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settingsForm.phone || ""}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>WhatsApp Number (e.g. 971588338927)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settingsForm.whatsapp || ""}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            whatsapp: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={settingsForm.email || ""}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Office Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settingsForm.address || ""}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* ABOUT US SECTION */}
                  <h3 className="settings-section-title">
                    <i className="fa-solid fa-quote-left"></i> About Us Section
                  </h3>
                  <div className="form-field">
                    <label>About Us Featured Quote</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={settingsForm.aboutQuote || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          aboutQuote: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-field">
                    <label>Main Arch Photo URL or Upload</label>
                    <div className="image-input-group">
                      <div
                        className="image-preview-box"
                        style={{ height: "120px" }}
                      >
                        {settingsForm.aboutArchImg ? (
                          <img
                            src={settingsForm.aboutArchImg}
                            alt="Arch Preview"
                            style={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span className="image-preview-placeholder">
                            <i className="fa-regular fa-image"></i> Arch Photo
                          </span>
                        )}
                      </div>
                      <div className="image-input-controls">
                        <input
                          type="text"
                          className="form-control"
                          value={settingsForm.aboutArchImg || ""}
                          placeholder="https://..."
                          style={{ flex: 1 }}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              aboutArchImg: e.target.value,
                            })
                          }
                        />
                        <label className="file-upload-btn-label">
                          <i className="fa-solid fa-cloud-arrow-up"></i> Upload
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files && e.target.files[0];
                              if (file) {
                                handleSettingsFileUpload("aboutArchImg", file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* FLOATING BUBBLES PHOTOS */}
                  <h3 className="settings-section-title">
                    <i className="fa-solid fa-images"></i> About Us Floating
                    Bubbles Photos
                  </h3>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Bubble 1: Waterfalls / Landmark</label>
                      <div className="image-input-group">
                        <div
                          className="image-preview-box"
                          style={{ height: "80px", marginBottom: "8px" }}
                        >
                          {settingsForm.bubble1Img ? (
                            <img
                              src={settingsForm.bubble1Img}
                              alt="Bubble 1"
                              style={{
                                maxHeight: "100%",
                                maxWidth: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <span className="image-preview-placeholder">
                              <i className="fa-regular fa-image"></i> Bubble 1
                            </span>
                          )}
                        </div>
                        <div className="image-input-controls">
                          <input
                            type="text"
                            className="form-control"
                            value={settingsForm.bubble1Img || ""}
                            placeholder="https://..."
                            style={{ flex: 1 }}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                bubble1Img: e.target.value,
                              })
                            }
                          />
                          <label className="file-upload-btn-label">
                            <i className="fa-solid fa-cloud-arrow-up"></i>{" "}
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file =
                                  e.target.files && e.target.files[0];
                                if (file) {
                                  handleSettingsFileUpload("bubble1Img", file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Bubble 2: Coastline / Beach</label>
                      <div className="image-input-group">
                        <div
                          className="image-preview-box"
                          style={{ height: "80px", marginBottom: "8px" }}
                        >
                          {settingsForm.bubble2Img ? (
                            <img
                              src={settingsForm.bubble2Img}
                              alt="Bubble 2"
                              style={{
                                maxHeight: "100%",
                                maxWidth: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <span className="image-preview-placeholder">
                              <i className="fa-regular fa-image"></i> Bubble 2
                            </span>
                          )}
                        </div>
                        <div className="image-input-controls">
                          <input
                            type="text"
                            className="form-control"
                            value={settingsForm.bubble2Img || ""}
                            placeholder="https://..."
                            style={{ flex: 1 }}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                bubble2Img: e.target.value,
                              })
                            }
                          />
                          <label className="file-upload-btn-label">
                            <i className="fa-solid fa-cloud-arrow-up"></i>{" "}
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file =
                                  e.target.files && e.target.files[0];
                                if (file) {
                                  handleSettingsFileUpload("bubble2Img", file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Bubble 3: Desert / Excursion</label>
                    <div className="image-input-group">
                      <div
                        className="image-preview-box"
                        style={{ height: "80px", marginBottom: "8px" }}
                      >
                        {settingsForm.bubble3Img ? (
                          <img
                            src={settingsForm.bubble3Img}
                            alt="Bubble 3"
                            style={{
                              maxHeight: "100%",
                              maxWidth: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span className="image-preview-placeholder">
                            <i className="fa-regular fa-image"></i> Bubble 3
                          </span>
                        )}
                      </div>
                      <div className="image-input-controls">
                        <input
                          type="text"
                          className="form-control"
                          value={settingsForm.bubble3Img || ""}
                          placeholder="https://..."
                          style={{ flex: 1 }}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              bubble3Img: e.target.value,
                            })
                          }
                        />
                        <label className="file-upload-btn-label">
                          <i className="fa-solid fa-cloud-arrow-up"></i> Upload
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files && e.target.files[0];
                              if (file) {
                                handleSettingsFileUpload("bubble3Img", file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div
                    className="settings-actions-footer"
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "14px",
                      marginTop: "24px",
                      paddingTop: "20px",
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <button
                      type="button"
                      className="btn-action-cancel"
                      onClick={() => {
                        setSettingsForm(siteData.settings);
                        toast("Settings discarded.", { icon: "ℹ️" });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-action-save"
                      disabled={isSavingSettings}
                      style={{
                        opacity: isSavingSettings ? 0.75 : 1,
                        cursor: isSavingSettings ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {isSavingSettings ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          <span>Saving Settings...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-check"></i>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ======================================================================
           UNIVERSAL MODAL DIALOG
           ====================================================================== */}
      <div className={`admin-modal-backdrop ${isModalOpen ? "open" : ""}`}>
        <div className="admin-modal-card">
          <div className="modal-header">
            <h3>
              {editingItemId
                ? `Edit ${modalCollection === "holidayPackage" ? "Special Holiday Package" : modalCollection}`
                : `Add New ${modalCollection === "holidayPackage" ? "Special Holiday Package" : modalCollection}`}
            </h3>
            <button
              type="button"
              className="modal-close-x"
              onClick={closeModal}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form
            onSubmit={handleModalSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              margin: 0,
              padding: 0,
            }}
          >
            <div
              className="modal-body"
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                minHeight: 0,
                maxHeight: "calc(90vh - 140px)",
                padding: "22px 26px",
              }}
            >
              {/* IMAGE URL & UPLOAD PREVIEW */}
              <div className="form-field">
                <label>Featured Image URL or Upload</label>
                <div className="image-input-group">
                  <div
                    className="image-preview-box"
                    style={{ height: "120px", position: "relative" }}
                  >
                    {uploadingImage ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          color: "#0284c7",
                        }}
                      >
                        <i
                          className="fa-solid fa-circle-notch fa-spin"
                          style={{ fontSize: "1.6rem" }}
                        ></i>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                          Uploading image...
                        </span>
                      </div>
                    ) : imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/image/air2.jpg";
                        }}
                      />
                    ) : (
                      <span className="image-preview-placeholder">
                        <i className="fa-regular fa-image"></i> Image Preview
                      </span>
                    )}
                  </div>
                  <div className="image-input-controls">
                    <input
                      type="text"
                      className="form-control"
                      value={
                        modalCollection === "review"
                          ? modalFormData.avatar || ""
                          : modalFormData.image || ""
                      }
                      placeholder="https://..."
                      style={{ flex: 1 }}
                      onChange={(e) => {
                        const url = e.target.value;
                        setImagePreview(url);
                        if (modalCollection === "review") {
                          setModalFormData({ ...modalFormData, avatar: url });
                        } else {
                          setModalFormData({ ...modalFormData, image: url });
                        }
                      }}
                    />
                    <label className="file-upload-btn-label">
                      <i
                        className={`fa-solid ${uploadingImage ? "fa-circle-notch fa-spin" : "fa-cloud-arrow-up"}`}
                      ></i>{" "}
                      {uploadingImage ? "Uploading" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        disabled={uploadingImage}
                        onChange={handleModalFileUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* DYNAMIC FIELDS: WHY CHOOSE US */}
              {(modalCollection === "whyChooseUs" ||
                modalCollection === "feature") && (
                <>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Feature Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.title || ""}
                        placeholder="e.g. Tour Guide"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>
                        Icon Class (e.g. fa-solid fa-user-tie, fa-solid fa-tags)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.icon || "fa-solid fa-star"}
                        placeholder="fa-solid fa-user-tie"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            icon: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>
                        Badge Pill Text (e.g. Top Rated, Best Value)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.badge || ""}
                        placeholder="Certified Staff"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            badge: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Price / Tag (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.price || ""}
                        placeholder="Included / From $49"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            price: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Description Paragraph</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={
                        modalFormData.description || modalFormData.desc || ""
                      }
                      placeholder="Brief details about this feature or guarantee..."
                      onChange={(e) =>
                        setModalFormData({
                          ...modalFormData,
                          description: e.target.value,
                          desc: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </>
              )}

              {/* DYNAMIC FIELDS: WALLPAPER */}
              {modalCollection === "wallpaper" && (
                <>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Badge Text</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.badge || ""}
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            badge: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>
                        Badge Icon (fa-plane, fa-kaaba, fa-umbrella-beach)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.badgeIcon || "fa-plane"}
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            badgeIcon: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Main Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.title || ""}
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Gold Highlight Text</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.highlight || ""}
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            highlight: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Description Paragraph</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={modalFormData.desc || ""}
                      onChange={(e) =>
                        setModalFormData({
                          ...modalFormData,
                          desc: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Primary Button Text</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.primaryBtnText || ""}
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            primaryBtnText: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Secondary Button Text</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.secondaryBtnText || ""}
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            secondaryBtnText: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {/* DYNAMIC FIELDS: ATTRACTION */}
              {modalCollection === "attraction" && (
                <>
                  <div className="form-field">
                    <label>Attraction Landmark Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={modalFormData.name || ""}
                      placeholder="e.g. Burj Khalifa"
                      onChange={(e) =>
                        setModalFormData({
                          ...modalFormData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Activities Count</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.activities || ""}
                        placeholder="145 activities"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            activities: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Price</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.price || ""}
                        placeholder="$95"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            price: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* DYNAMIC FIELDS: GALLERY */}
              {modalCollection === "gallery" && (
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Picture Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={modalFormData.title || ""}
                      placeholder="e.g. Sultan Qaboos Grand Mosque"
                      onChange={(e) =>
                        setModalFormData({
                          ...modalFormData,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={modalFormData.location || ""}
                      placeholder="Salalah, Oman"
                      onChange={(e) =>
                        setModalFormData({
                          ...modalFormData,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELDS: TOUR */}
              {(modalCollection === "tour" || modalCollection === "holidayPackage") && (
                <>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Tour Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.title || ""}
                        placeholder="e.g. Dubai Red Dunes Desert Safari"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Location / Destination</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.location || modalFormData.tagline || ""}
                        placeholder="Dubai, UAE"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            location: e.target.value,
                            tagline: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Duration / Hours</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.duration || modalFormData.hours || ""}
                        placeholder="08-Hrs or Full Day (8 Hours)"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            duration: e.target.value,
                            hours: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Price</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.price || ""}
                        placeholder="$120"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            price: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Vehicle / Transport</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.vehicle || modalFormData.carHours || ""}
                        placeholder="4WD Cruiser"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            vehicle: e.target.value,
                            carHours: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Driver / Guide</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.guide || ""}
                        placeholder="Driver-guide"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            guide: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Capacity / Group Size</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.capacity || modalFormData.groupSize || ""}
                        placeholder="4 Persons"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            capacity: e.target.value,
                            groupSize: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Rating (e.g. 5.0)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.rating ?? "5.0"}
                        placeholder="5.0"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            rating: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {/* DYNAMIC FIELDS: TRANSFER */}
              {modalCollection === "transfer" && (
                <>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Vehicle Model / Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.title || ""}
                        placeholder="Toyota Land Cruiser VIP"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Vehicle Category</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.category || ""}
                        placeholder="Luxury 4x4 Fleet"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            category: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div
                    className="form-grid-3"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "12px",
                    }}
                  >
                    <div className="form-field">
                      <label>Passengers</label>
                      <input
                        type="number"
                        className="form-control"
                        value={modalFormData.passengers || 4}
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            passengers: parseInt(e.target.value, 10) || 1,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Luggage Bags</label>
                      <input
                        type="number"
                        className="form-control"
                        value={modalFormData.luggage || 3}
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            luggage: parseInt(e.target.value, 10) || 1,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Fare Price</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.price || ""}
                        placeholder="$45"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            price: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* DYNAMIC FIELDS: PACKAGE */}
              {modalCollection === "package" && (
                <>
                  {/* FEATURED OPTION TOGGLE */}
                  <div
                    className="package-featured-toggle-box"
                    style={{
                      background: modalFormData.featured
                        ? "linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(217, 119, 6, 0.08))"
                        : "var(--ad-gray-50, #f8fafc)",
                      border: modalFormData.featured
                        ? "1.5px solid #f59e0b"
                        : "1px solid var(--ad-gray-300, #cbd5e1)",
                      borderRadius: "12px",
                      padding: "16px 18px",
                      marginBottom: "18px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "10px",
                            background: modalFormData.featured
                              ? "linear-gradient(135deg, #f59e0b, #d97706)"
                              : "var(--ad-gray-200, #e2e8f0)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: modalFormData.featured ? "#fff" : "var(--ad-gray-500, #64748b)",
                            fontSize: "19px",
                            boxShadow: modalFormData.featured
                              ? "0 4px 12px rgba(245, 158, 11, 0.35)"
                              : "none",
                            transition: "all 0.3s ease",
                            flexShrink: 0,
                          }}
                        >
                          <i className="fa-solid fa-star"></i>
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "14.5px",
                              color: "var(--ad-gray-900, #0f172a)",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            Featured Package Option
                            {modalFormData.featured ? (
                              <span
                                style={{
                                  fontSize: "10.5px",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  background: "#fef3c7",
                                  color: "#b45309",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  border: "1px solid #fde68a",
                                }}
                              >
                                Featured Active
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: "10.5px",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  background: "var(--ad-gray-200, #e2e8f0)",
                                  color: "var(--ad-gray-600, #475569)",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                }}
                              >
                                Standard
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--ad-gray-500, #64748b)",
                              marginTop: "2px",
                            }}
                          >
                            Enable this feature option to highlight this package in "Popular Destinations &amp; Featured Packages"
                          </div>
                        </div>
                      </div>

                      <label
                        style={{
                          position: "relative",
                          display: "inline-block",
                          width: "50px",
                          height: "26px",
                          cursor: "pointer",
                          margin: 0,
                          flexShrink: 0,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(modalFormData.featured)}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setModalFormData({
                              ...modalFormData,
                              featured: val,
                              isFeatured: val,
                            });
                          }}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: modalFormData.featured ? "#f59e0b" : "#cbd5e1",
                            borderRadius: "34px",
                            transition: "all 0.3s ease",
                            boxShadow: modalFormData.featured
                              ? "0 0 10px rgba(245, 158, 11, 0.5)"
                              : "none",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              height: "20px",
                              width: "20px",
                              left: modalFormData.featured ? "26px" : "3px",
                              bottom: "3px",
                              backgroundColor: "white",
                              borderRadius: "50%",
                              transition: "all 0.3s ease",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                          />
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Package Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.title || ""}
                        placeholder="5-Star Executive Umrah Package"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Package Category</label>
                      <select
                        className="form-control"
                        value={modalFormData.category || "tours"}
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="tours">Holiday Tours</option>
                        <option value="umrah">Hajj &amp; Umrah</option>
                        <option value="flights">International Flights</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Badge Pill Text</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.badge || ""}
                        placeholder="5-Star Deluxe / Best Seller"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            badge: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Duration</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.duration || ""}
                        placeholder="10 Days / 9 Nights"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            duration: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Package Starting Price</label>
                    <input
                      type="text"
                      className="form-control"
                      value={modalFormData.price || ""}
                      placeholder="$1,299"
                      onChange={(e) =>
                        setModalFormData({
                          ...modalFormData,
                          price: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {/* INCLUSIONS MANUAL SET FACILITY */}
                  <div
                    className="package-inclusions-facility"
                    style={{
                      background: "var(--ad-gray-50, #f8fafc)",
                      border: "1.5px solid var(--ad-gray-300, #cbd5e1)",
                      borderRadius: "14px",
                      padding: "18px 20px",
                      marginTop: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    {/* Facility Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid var(--ad-gray-200, #e2e8f0)",
                        paddingBottom: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <i className="fa-solid fa-list-check" style={{ fontSize: "16px", color: "#0284c7" }}></i>
                        <span style={{ fontWeight: 700, fontSize: "14.5px", color: "var(--ad-gray-900, #0f172a)" }}>
                          Inclusions Management (Manual Set Facility)
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: "#e0f2fe",
                            color: "#0369a1",
                            fontWeight: 700,
                          }}
                        >
                          {(modalFormData.inclusions || []).length} Active
                        </span>
                      </div>
                      {(modalFormData.inclusions || []).length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllInclusions}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <i className="fa-solid fa-trash-can"></i> Clear All
                        </button>
                      )}
                    </div>

                    {/* Active Inclusions Tag Pills */}
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--ad-gray-600, #475569)", marginBottom: "8px", display: "block" }}>
                        Current Package Inclusions:
                      </label>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          minHeight: "40px",
                          padding: "10px 12px",
                          background: "#ffffff",
                          border: "1px dashed var(--ad-gray-300, #cbd5e1)",
                          borderRadius: "10px",
                          alignItems: "center",
                        }}
                      >
                        {(modalFormData.inclusions || []).length === 0 ? (
                          <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
                            No inclusions added yet. Use single item add, comma-separated field, or quick picks below.
                          </span>
                        ) : (
                          (modalFormData.inclusions || []).map((inc, idx) => {
                            const text = typeof inc === "object" ? inc.text : inc;
                            return (
                              <span
                                key={idx}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "6px 12px",
                                  borderRadius: "20px",
                                  background: "#f0fdf4",
                                  border: "1px solid #bbf7d0",
                                  color: "#166534",
                                  fontSize: "12.5px",
                                  fontWeight: 600,
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                }}
                              >
                                <i className="fa-solid fa-circle-check" style={{ color: "#22c55e", fontSize: "12px" }}></i>
                                {text}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInclusion(idx)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#dc2626",
                                    cursor: "pointer",
                                    padding: "0 2px",
                                    marginLeft: "4px",
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                  title={`Remove "${text}"`}
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Manual Single Add Input Bar */}
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--ad-gray-600, #475569)", marginBottom: "6px", display: "block" }}>
                        Manual Add Item (Type &amp; Add):
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          className="form-control"
                          value={singleInclusionInput}
                          placeholder="e.g. 5-Star Hotel or Return Flights"
                          onChange={(e) => setSingleInclusionInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSingleInclusion();
                            }
                          }}
                          style={{ flex: 1, fontSize: "13px" }}
                        />
                        <button
                          type="button"
                          className="btn-admin btn-admin-primary"
                          onClick={handleAddSingleInclusion}
                          style={{
                            padding: "8px 18px",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <i className="fa-solid fa-plus"></i> Add Item
                        </button>
                      </div>
                    </div>

                    {/* Comma-Separated Direct Input (Requested: Inclusions Comma-separated) */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--ad-gray-600, #475569)", margin: 0 }}>
                          Inclusions (Comma-separated text input)
                        </label>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          Type or paste items separated by commas freely
                        </span>
                      </div>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={inclusionsRawText}
                        placeholder="5-Star Hotel, Return Flights, Daily Breakfast, VIP Airport Transfers"
                        onChange={(e) => handleRawInclusionsChange(e.target.value)}
                        style={{
                          fontSize: "13px",
                          lineHeight: "1.4",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    {/* One-Click Quick Presets */}
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--ad-gray-600, #475569)", marginBottom: "6px", display: "block" }}>
                        Quick-Add Popular Inclusions:
                      </label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {[
                          "5-Star Hotel",
                          "Return Flights",
                          "Daily Breakfast",
                          "VIP Airport Transfers",
                          "Guided City Tours",
                          "Umrah Visa Processing",
                          "Haram Front View",
                          "Private GMC Transport",
                          "4-Star Alpine Lodge",
                          "Speedboat Cruise",
                          "Desert Safari Dinner",
                          "24/7 Concierge Support",
                        ].map((preset, pIdx) => {
                          const isAlreadyAdded = (modalFormData.inclusions || [])
                            .map((i) => (typeof i === "object" ? i.text : i))
                            .includes(preset);
                          return (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => handleQuickAddInclusion(preset)}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "14px",
                                fontSize: "11.5px",
                                fontWeight: 600,
                                cursor: "pointer",
                                border: isAlreadyAdded
                                  ? "1px solid #16a34a"
                                  : "1px solid var(--ad-gray-300, #cbd5e1)",
                                background: isAlreadyAdded ? "#dcfce7" : "#ffffff",
                                color: isAlreadyAdded ? "#15803d" : "var(--ad-gray-700, #334155)",
                                transition: "all 0.2s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <i
                                className={isAlreadyAdded ? "fa-solid fa-check" : "fa-solid fa-plus"}
                                style={{ fontSize: "10px" }}
                              ></i>
                              {preset}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* DYNAMIC FIELDS: REVIEW */}
              {modalCollection === "review" && (
                <>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Reviewer Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.name || ""}
                        placeholder="Bhavesh S"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Star Rating (1 - 5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        className="form-control"
                        value={modalFormData.stars || 5}
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            stars: parseInt(e.target.value, 10) || 5,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Review Quote</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={modalFormData.quote || ""}
                      placeholder="Share customer's experience..."
                      onChange={(e) =>
                        setModalFormData({
                          ...modalFormData,
                          quote: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </>
              )}

              {/* DYNAMIC FIELDS: WHY CHOOSE US / FEATURE CARDS */}
              {(modalCollection === "whyChooseUs" ||
                modalCollection === "feature") && (
                <>
                  <div className="form-field">
                    <label>Card Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={modalFormData.title || ""}
                      placeholder="e.g. Worldwide Flights"
                      onChange={(e) =>
                        setModalFormData({
                          ...modalFormData,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div
                    className="form-grid-3"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "12px",
                    }}
                  >
                    <div className="form-field">
                      <label>Icon (Emoji or FA class)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.icon || ""}
                        placeholder="✈️ or fa-solid fa-plane"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            icon: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Price Tag / Starting At</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.price || ""}
                        placeholder="From $299"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            price: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Badge</label>
                      <input
                        type="text"
                        className="form-control"
                        value={modalFormData.badge || ""}
                        placeholder="Featured"
                        onChange={(e) =>
                          setModalFormData({
                            ...modalFormData,
                            badge: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Description Paragraph</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={
                        modalFormData.description || modalFormData.desc || ""
                      }
                      placeholder="Book cheap international flights with top airlines..."
                      onChange={(e) =>
                        setModalFormData({
                          ...modalFormData,
                          description: e.target.value,
                          desc: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <div
              className="modal-footer"
              style={{
                flexShrink: 0,
                padding: "16px 26px",
                borderTop: "1px solid #e2e8f0",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
                position: "sticky",
                bottom: 0,
                zIndex: 20,
                boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.04)",
              }}
            >
              <button
                type="button"
                className="btn-action-cancel"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-action-save"
                disabled={isSubmittingModal || uploadingImage}
                style={{
                  opacity: isSubmittingModal || uploadingImage ? 0.75 : 1,
                  cursor: isSubmittingModal || uploadingImage ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isSubmittingModal ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Saving...</span>
                  </>
                ) : uploadingImage ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Uploading Image...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ======================================================================
           ADD CUSTOMER INQUIRY MODAL (ADMIN LOGGING)
           ====================================================================== */}
      <div className={`admin-modal-backdrop ${isAddEnquiryOpen ? "open" : ""}`}>
        <div className="admin-modal-card">
          <div className="modal-header">
            <h3>
              <i className="fa-solid fa-user-plus text-primary"></i> Add
              Customer Inquiry
            </h3>
            <button
              type="button"
              className="modal-close-x"
              onClick={() => setIsAddEnquiryOpen(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form
            onSubmit={handleCreateManualEnquiry}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              margin: 0,
              padding: 0,
            }}
          >
            <div
              className="modal-body"
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                minHeight: 0,
                maxHeight: "calc(90vh - 140px)",
                padding: "22px 26px",
              }}
            >
              <div className="form-grid-2">
                <div className="form-field">
                  <label>Customer Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. John Doe"
                    value={newEnquiryForm.fullName}
                    onChange={(e) =>
                      setNewEnquiryForm({
                        ...newEnquiryForm,
                        fullName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Phone / WhatsApp Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+971 58 833 8927"
                    value={newEnquiryForm.phone}
                    onChange={(e) =>
                      setNewEnquiryForm({
                        ...newEnquiryForm,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="customer@example.com"
                    value={newEnquiryForm.email}
                    onChange={(e) =>
                      setNewEnquiryForm({
                        ...newEnquiryForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-field">
                  <label>Service / Tour Package</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 5-Star Executive Umrah Package"
                    value={newEnquiryForm.serviceRequired}
                    onChange={(e) =>
                      setNewEnquiryForm({
                        ...newEnquiryForm,
                        serviceRequired: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Inquiry Message / Customer Notes</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Enter passenger count, travel dates, budget, or custom notes..."
                  value={newEnquiryForm.message}
                  onChange={(e) =>
                    setNewEnquiryForm({
                      ...newEnquiryForm,
                      message: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                flexShrink: 0,
                padding: "16px 26px",
                borderTop: "1px solid #e2e8f0",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
                position: "sticky",
                bottom: 0,
                zIndex: 20,
                boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.04)",
              }}
            >
              <button
                type="button"
                className="btn-action-cancel"
                onClick={() => setIsAddEnquiryOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-action-save"
                disabled={isSavingEnquiry}
                style={{
                  opacity: isSavingEnquiry ? 0.75 : 1,
                  cursor: isSavingEnquiry ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isSavingEnquiry ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Saving Inquiry...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    <span>Save Customer Inquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
