import { useState , useEffect } from "react";
import axios from "axios";






export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [privacy, setPrivacy] = useState("public");
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverPrivacy, setCoverPrivacy] = useState("public");
  const [savingCover, setSavingCover] = useState(false);
  const [showFullCover, setShowFullCover] = useState(false);
  const [coverRemoved, setCoverRemoved] = useState(false);
  const [myPostsCount, setMyPostsCount] = useState(0);
  const [savedPostsCount, setSavedPostsCount] = useState(0);

 const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0];

   if (!file) return;

   if (!file.type.startsWith("image/")) return;

   setSelectedPhoto(file);
   setPhotoPreview(URL.createObjectURL(file));
   setZoom(1);
   setPrivacy("public");
   setShowPhotoModal(true);

   e.target.value = "";
  };
  


 const handleUploadPhoto = async () => {
   if (!selectedPhoto || uploadingPhoto) return;

   const token = localStorage.getItem("token");

   if (!token) {
     console.error("Token not found");
     return;
   }

   try {
     setUploadingPhoto(true);

     // 1. Upload profile photo
     const photoFormData = new FormData();
     photoFormData.append("photo", selectedPhoto);

     const uploadResponse = await axios.put(
       "https://route-posts.routemisr.com/users/upload-photo",
       photoFormData,
       {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       },
     );

     console.log("Photo uploaded:", uploadResponse.data);

     // 2. Get updated profile
     const profileResponse = await axios.get(
       "https://route-posts.routemisr.com/users/profile-data",
       {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       },
     );

     const profileData = profileResponse.data?.data;

     const updatedProfile =
       profileData?.user || profileData?.profile || profileData;

     const updatedUser = {
       ...user,
       ...updatedProfile,
     };

     localStorage.setItem("user", JSON.stringify(updatedUser));

     // 3. Create a normal post with the new photo
     const postFormData = new FormData();

     postFormData.append("body", "Updated their profile photo");
     postFormData.append("image", selectedPhoto);

     await axios.post("https://route-posts.routemisr.com/posts", postFormData, {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     });

     console.log("Profile photo post created successfully");

     // 4. Close modal and refresh profile
     if (photoPreview) {
       URL.revokeObjectURL(photoPreview);
     }

     setShowPhotoModal(false);
     setSelectedPhoto(null);
     setPhotoPreview(null);
     setZoom(1);

     window.location.reload();
   } catch (error) {
     console.error("Profile photo update error:", error);
   } finally {
     setUploadingPhoto(false);
   }
  };
  
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setSelectedCover(file);
    setCoverRemoved(false);
    setCoverPreview(URL.createObjectURL(file));
    setShowCoverModal(true);

    e.target.value = "";
  };


  const handleUploadCover = async () => {
    if (!selectedCover || savingCover) return;

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token not found");
      return;
    }

    try {
      setSavingCover(true);

      // 1. Upload cover picture
      const coverFormData = new FormData();
      coverFormData.append("cover", selectedCover);

      await axios.put(
        "https://route-posts.routemisr.com/users/upload-cover",
        coverFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 2. Get updated profile data
      const profileResponse = await axios.get(
        "https://route-posts.routemisr.com/users/profile-data",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const profileData = profileResponse.data?.data;
      const updatedProfile =
        profileData?.user || profileData?.profile || profileData;

      const updatedUser = {
        ...user,
        ...updatedProfile,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      // 3. Create a normal post in Feed
      const postFormData = new FormData();

      postFormData.append("body", "Updated their cover picture");
      postFormData.append("image", selectedCover);
      postFormData.append("privacy", coverPrivacy);

      await axios.post(
        "https://route-posts.routemisr.com/posts",
        postFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 4. Close modal and clean up
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }

      setShowCoverModal(false);
      setSelectedCover(null);
      setCoverPreview(null);
      setCoverPrivacy("public");

      window.location.reload();
    } catch (error) {
      console.error("Cover upload error:", error);
    } finally {
      setSavingCover(false);
    }
  };

  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoadingProfile(false);
        return;
      }

      try {
        const response = await axios.get(
          "https://route-posts.routemisr.com/users/profile-data",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

       console.log("My Profile Data:", JSON.stringify(response.data, null, 2));
        setProfileData(response.data?.data?.user);
        const currentUser = response.data?.data?.user;
        setProfileData(currentUser);

        const userId = currentUser?._id;

        if (userId) {
          try {
            const [postsResponse, bookmarksResponse] = await Promise.all([
              axios.get(
                `https://route-posts.routemisr.com/users/${userId}/posts`,
                { headers: { Authorization: `Bearer ${token}` } },
              ),
              axios.get("https://route-posts.routemisr.com/users/bookmarks", {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ]);

           const postsData = postsResponse.data?.data?.posts || [];
           const bookmarksData = bookmarksResponse.data?.meta?.pagination;

           setMyPostsCount(postsData.length);
           setSavedPostsCount(
             bookmarksData?.total ??
               bookmarksResponse.data?.data?.bookmarks?.length ??
               0,
           );
          } catch (error) {
            console.error("Posts and bookmarks error:", error);
          }
        }
      } catch (error) {
        console.error("Profile data error:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, []);


  

  return (
    <>
      {showFullPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowFullPhoto(false)}
        >
          <button
            type="button"
            onClick={() => setShowFullPhoto(false)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            ✕
          </button>

          <img
            src={user.photo || "/default-profile.png"}
            alt="Profile photo"
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {showPhotoModal && photoPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
          <div className="w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
            <div className="mb-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                Adjust profile photo
              </h3>
              <p className="text-sm text-slate-500">
                Drag to reposition and use zoom for perfect framing.
              </p>
            </div>

            <div className="mx-auto w-full max-w-[340px] pb-1">
              <div className="relative flex h-[320px] w-[320px] items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                <img
                  alt="Crop preview"
                  draggable={false}
                  src={photoPreview}
                  className="max-h-full max-w-full select-none object-contain"
                  style={{
                    transform: `scale(${zoom})`,
                    transition: "transform 0.15s",
                  }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Zoom</span>
                <span>{zoom.toFixed(2)}x</span>
              </div>

              <input
                min="1"
                max="3"
                step="0.01"
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#1877f2]"
                type="range"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>

            <div className="mt-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Post privacy
              </p>

              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#1877f2]"
              >
                <option value="public">Public</option>
                <option value="following">Followers</option>
                <option value="only_me">Only me</option>
              </select>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (photoPreview) URL.revokeObjectURL(photoPreview);
                  setShowPhotoModal(false);
                  setSelectedPhoto(null);
                  setPhotoPreview(null);
                  setZoom(1);
                }}
                className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUploadPhoto}
                disabled={!selectedPhoto || uploadingPhoto}
                className="inline-flex items-center rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingPhoto ? "Uploading..." : "Save photo"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-3 py-3.5">
        <main className="min-w-0">
          <div className="space-y-5 sm:space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,.06)] sm:rounded-[28px]">
              <div
                style={{
                  backgroundImage: `url("${
                    coverRemoved
                      ? ""
                      : coverPreview || user.cover || user.coverPhoto || ""
                  }")`,
                }}
                className="group/cover relative h-44 bg-[linear-gradient(112deg,#0f172a_0%,#1e3a5f_36%,#2b5178_72%,#5f8fb8_100%)] sm:h-52 lg:h-60"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_24%,rgba(255,255,255,.14)_0%,rgba(255,255,255,0)_36%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,rgba(186,230,253,.22)_0%,rgba(186,230,253,0)_44%)]" />
                <div className="absolute -left-16 top-10 h-36 w-36 rounded-full bg-white/8 blur-3xl" />
                <div className="absolute right-8 top-6 h-48 w-48 rounded-full bg-[#c7e6ff]/10 blur-3xl" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />
                <div className="pointer-events-none absolute right-2 top-2 z-10 flex max-w-[90%] flex-wrap items-center justify-end gap-1.5 opacity-100 transition duration-200 sm:right-3 sm:top-3 sm:max-w-none sm:gap-2 sm:opacity-0 sm:group-hover/cover:opacity-100 sm:group-focus-within/cover:opacity-100">
                  {coverRemoved ||
                  (!coverPreview && !user.cover && !user.coverPhoto) ? (
                    <label className="pointer-events-auto inline-flex cursor-pointer items-center gap-1 rounded-lg bg-black/45 px-2 py-1 text-[11px] font-bold text-white backdrop-blur transition hover:bg-black/60 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      Add cover
                      <input
                        accept="image/*"
                        className="hidden"
                        type="file"
                        onChange={handleCoverSelect}
                      />
                    </label>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowFullCover(true)}
                        className="pointer-events-auto rounded-lg bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-black/60"
                      >
                        View Cover
                      </button>

                      <label className="pointer-events-auto cursor-pointer rounded-lg bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-black/60">
                        Change Cover
                        <input
                          accept="image/*"
                          className="hidden"
                          type="file"
                          onChange={handleCoverSelect}
                        />
                      </label>

                      <button
                        type="button"
                        className="pointer-events-auto rounded-lg bg-red-600/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-red-700"
                        onClick={() => {
                          if (coverPreview) {
                            URL.revokeObjectURL(coverPreview);
                          }

                          setCoverPreview(null);
                          setSelectedCover(null);
                          setShowCoverModal(false);
                          setShowFullCover(false);
                          setCoverRemoved(true);
                        }}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="relative -mt-12 px-3 pb-5 sm:-mt-16 sm:px-8 sm:pb-6">
                <div className="rounded-3xl border border-white/60 bg-white/92 p-5  backdrop-blur-xl sm:p-7">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-end gap-4">
                        <div className="group/avatar relative shrink-0">
                          <button
                            type="button"
                            className="cursor-zoom-in rounded-full"
                          >
                            <img
                              alt={user.name || "user"}
                              className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md ring-2 ring-[#dbeafe]"
                              src={
                                user.photo ||
                                "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
                              }
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowFullPhoto(true)}
                            className="absolute bottom-1 left-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-[#1877f2] opacity-100 shadow-sm ring-1 ring-slate-200 transition duration-200 hover:bg-slate-50 sm:opacity-0 sm:group-hover/avatar:opacity-100 sm:group-focus-within/avatar:opacity-100"
                            title="View profile photo"
                            aria-label="View profile photo"
                          ></button>
                          <label className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#1877f2] text-blue-300 opacity-100 shadow-sm transition duration-200 hover:bg-[#166fe5] sm:opacity-0 sm:group-hover/avatar:opacity-100 sm:group-focus-within/avatar:opacity-100">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="17"
                              height="17"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-camera"
                              aria-hidden="true"
                            >
                              <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
                              <circle cx="12" cy="13" r="3" />
                            </svg>
                            <input
                              accept="image/*"
                              className="hidden"
                              type="file"
                              onChange={handlePhotoSelect}
                            />
                          </label>
                        </div>
                        <div className="min-w-0 pb-1">
                          <h2 className="truncate text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
                            {user.name || "User"}
                          </h2>
                          <p className="mt-1 text-lg font-semibold text-slate-500 sm:text-xl">
                            @{user.username || "username"}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#d7e7ff] bg-[#eef6ff] px-3 py-1 text-xs font-bold text-[#0b57d0]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-users"
                              aria-hidden="true"
                            >
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <circle cx="9" cy="7" r="4" />
                            </svg>
                            Route Posts member
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid w-full grid-cols-3 gap-2 lg:w-[520px]">
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center sm:px-4 sm:py-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                          Followers
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                          {profileData?.followersCount ?? 0}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center sm:px-4 sm:py-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                          Following
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                          {profileData?.followingCount ?? 0}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center sm:px-4 sm:py-4">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                          Bookmarks
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                          {profileData?.bookmarksCount ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-sm font-extrabold text-slate-800">
                        About
                      </h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-mail text-slate-500"
                            aria-hidden="true"
                          >
                            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                          </svg>
                          {user.email || "email@example.com"}
                        </p>
                        <p className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-users text-slate-500"
                            aria-hidden="true"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <circle cx="9" cy="7" r="4" />
                          </svg>
                          Active on Route Posts
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="rounded-2xl border border-[#dbeafe] bg-[#f6faff] px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#1f4f96]">
                          My posts
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-900">
                          {myPostsCount}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#dbeafe] bg-[#f6faff] px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#1f4f96]">
                          Saved posts
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-900">
                          {savedPostsCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {showFullCover && (
              <div
                className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4"
                onClick={() => setShowFullCover(false)}
              >
                <button
                  type="button"
                  onClick={() => setShowFullCover(false)}
                  className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  ✕
                </button>

                <img
                  src={coverPreview || user.cover || user.coverPhoto}
                  alt="Cover photo"
                  className="max-h-[85vh] max-w-[95vw] rounded-lg object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 sm:inline-flex sm:w-auto sm:gap-0">
                  <button className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition bg-white text-[#1877f2] shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-file-text"
                      aria-hidden="true"
                    >
                      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                      <path d="M10 9H8" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                    </svg>
                    My Posts
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition text-slate-600 hover:text-slate-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-bookmark"
                      aria-hidden="true"
                    >
                      <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" />
                    </svg>
                    Saved
                  </button>
                </div>
                <span className="rounded-full bg-[#e7f3ff] px-3 py-1 text-xs font-bold text-[#1877f2]">
                  0
                </span>
              </div>
              <div className="space-y-3">
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  You have not posted yet.
                </p>
              </div>
            </section>
          </div>
        </main>
        {showCoverModal && coverPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
              <h3 className="text-lg font-extrabold text-slate-900">
                Cover post privacy
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Choose who can see the post generated for your new cover photo.
              </p>

              <div className="mt-4 overflow-hidden rounded-xl">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-40 w-full object-cover"
                />
              </div>

              <div className="mt-4">
                <select
                  value={coverPrivacy}
                  onChange={(e) => setCoverPrivacy(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#1877f2]"
                >
                  <option value="public">Public</option>
                  <option value="following">Followers</option>
                  <option value="only_me">Only me</option>
                </select>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={savingCover}
                  onClick={() => {
                    URL.revokeObjectURL(coverPreview);
                    setCoverPreview(null);
                    setSelectedCover(null);
                    setShowCoverModal(false);
                    setCoverPrivacy("public");
                  }}
                  className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUploadCover}
                  disabled={!selectedCover || savingCover}
                  className="inline-flex items-center rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingCover ? "Saving..." : "Save cover"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
