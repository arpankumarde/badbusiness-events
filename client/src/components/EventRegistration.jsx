import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { server } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterEventForm = () => {
  const navigate = useNavigate();
  const pathLocation = useLocation();
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!accessToken) {
      navigate("/login", { state: { from: pathLocation } });
      return;
    }
    const fetchUserData = async () => {
      try {
        const response = await server.get("/api/v1/user/profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const user = response.data.user;
        setAttendeeName(user.username);
        setEmail(user.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data. Please try again later.");
      }
    };
    fetchUserData();
  }, [accessToken, navigate, pathLocation]);

  const { slug } = useParams();
  const [attendeeName, setAttendeeName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attendeeType, setAttendeeType] = useState("organization");
  const [typeName, setTypeName] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const eventResponse = await server.get(`/api/v1/event/${slug}`);
      const event = eventResponse.data.event;

      const eventDateTime = new Date(
        `${event.date}T${event.time}:00Z`
      ).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

      if (event.status !== "accepted") {
        toast.error(
          "Event is not yet accepted. You cannot register for this event."
        );
        return;
      }

      if (new Date() >= new Date(eventDateTime)) {
        toast.error(
          "Event has already started. You cannot register for this event."
        );
        return;
      }

      const response = await server.put(
        `/api/v1/event/register/${slug}`,
        {
          attendeeName,
          email,
          phone,
          attendeeType,
          typeName,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setAttendeeName("");
          setEmail("");
          setPhone("");
          setAttendeeType("organization");
          setTypeName("");
          setSuccess(false);
          toast.success("Registration successful!");
          navigate(`/event/${slug}`);
        }, 1000);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response.data.message ||
          "An error occurred. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-800 text-white flex justify-center items-center p-4">
      <ToastContainer />
      <div className="bg-neutral-600/80 p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <h2 className="text-3xl font-semibold mb-4">Register for Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="attendeeName">
              Name
            </label>
            <input
              type="text"
              id="attendeeName"
              placeholder="Enter Your Name"
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-800"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-800"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="phone">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              placeholder="Enter Your Phone No."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-800"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Type</label>
            <div className="flex gap-5 mt-4 ">
              <div className="flex gap-2">
                <input
                  type="radio"
                  id="organization"
                  name="attendeeType"
                  value="organization"
                  checked={attendeeType === "organization"}
                  onChange={(e) => setAttendeeType(e.target.value)}
                />
                <label htmlFor="organization" className="text-lg">
                  Professional
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="radio"
                  id="institute"
                  name="attendeeType"
                  value="institute"
                  checked={attendeeType === "institute"}
                  onChange={(e) => setAttendeeType(e.target.value)}
                />
                <label htmlFor="institute" className="text-lg">
                  Student
                </label>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="typeName">
              {attendeeType === "organization"
                ? "Organization Name"
                : "Institute Name"}
            </label>
            <input
              type="text"
              id="typeName"
              placeholder={`Enter Your ${
                attendeeType === "organization" ? "Organization" : "Institute"
              } Name`}
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-800"
            />
          </div>
          {loading ? (
            <button
              type="submit"
              className="w-full px-3 py-2 mt-6 bg-neutral-200 text-black font-bold rounded-md cursor-none">
              Registering
            </button>
          ) : (
            <button
              type="submit"
              className="w-full px-3 py-2 mt-6 bg-neutral-200 text-black font-bold rounded-md">
              Register
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterEventForm;
