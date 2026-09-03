from app.database import SessionLocal
from app.models import Agent, Lead, Property


PROPERTIES = [
	{
		"title": "Koramangala Garden Villa",
		"location": "Bengaluru",
		"property_type": "Villa",
		"price": 28500000,
	},
	{
		"title": "Whitefield Tech Park Apartment",
		"location": "Bengaluru",
		"property_type": "Apartment",
		"price": 12500000,
	},
	{
		"title": "Bandra Sea View Residence",
		"location": "Mumbai",
		"property_type": "Apartment",
		"price": 42500000,
	},
	{
		"title": "Powai Lakeside Home",
		"location": "Mumbai",
		"property_type": "Apartment",
		"price": 19800000,
	},
	{
		"title": "Gachibowli Skyline Flat",
		"location": "Hyderabad",
		"property_type": "Apartment",
		"price": 9800000,
	},
	{
		"title": "Jubilee Hills Courtyard House",
		"location": "Hyderabad",
		"property_type": "House",
		"price": 24000000,
	},
	{
		"title": "Koregaon Park Heritage Home",
		"location": "Pune",
		"property_type": "House",
		"price": 17500000,
	},
	{
		"title": "Hinjewadi Worklife Apartment",
		"location": "Pune",
		"property_type": "Apartment",
		"price": 7600000,
	},
	{
		"title": "Adyar Banyan Grove Villa",
		"location": "Chennai",
		"property_type": "Villa",
		"price": 22000000,
	},
	{
		"title": "OMR Marina Heights Flat",
		"location": "Chennai",
		"property_type": "Apartment",
		"price": 8900000,
	},
]

AGENTS = [
	{
		"name": "Ananya Rao",
		"email": "ananya.rao@example.com",
		"phone": "+91 90000 10001",
	},
	{
		"name": "Vikram Mehta",
		"email": "vikram.mehta@example.com",
		"phone": "+91 90000 10002",
	},
	{
		"name": "Kavya Iyer",
		"email": "kavya.iyer@example.com",
		"phone": "+91 90000 10003",
	},
	{
		"name": "Rohan Deshpande",
		"email": "rohan.deshpande@example.com",
		"phone": "+91 90000 10004",
	},
	{
		"name": "Meera Nair",
		"email": "meera.nair@example.com",
		"phone": "+91 90000 10005",
	},
]

LEADS = [
	("Aarav Sharma", "+91 91000 20001", "Koramangala Garden Villa", "New"),
	("Diya Patel", "+91 91000 20002", "Whitefield Tech Park Apartment", "Contacted"),
	("Ishaan Kapoor", "+91 91000 20003", "Bandra Sea View Residence", "Qualified"),
	("Nisha Verma", "+91 91000 20004", "Powai Lakeside Home", "Converted"),
	("Kabir Singh", "+91 91000 20005", "Gachibowli Skyline Flat", "New"),
	("Riya Kulkarni", "+91 91000 20006", "Jubilee Hills Courtyard House", "Contacted"),
	("Arjun Menon", "+91 91000 20007", "Koregaon Park Heritage Home", "Qualified"),
	("Pooja Shah", "+91 91000 20008", "Hinjewadi Worklife Apartment", "Converted"),
	("Aditya Joshi", "+91 91000 20009", "Adyar Banyan Grove Villa", "New"),
	("Sana Khan", "+91 91000 20010", "OMR Marina Heights Flat", "Contacted"),
	("Neel Bhat", "+91 91000 20011", "Koramangala Garden Villa", "Qualified"),
	("Tanvi Rao", "+91 91000 20012", "Whitefield Tech Park Apartment", "Converted"),
	("Yash Malhotra", "+91 91000 20013", "Bandra Sea View Residence", "New"),
	("Mahi Reddy", "+91 91000 20014", "Powai Lakeside Home", "Contacted"),
	("Devika Suresh", "+91 91000 20015", "Gachibowli Skyline Flat", "Qualified"),
	("Rahul Anand", "+91 91000 20016", "Jubilee Hills Courtyard House", "Converted"),
	("Sneha Patil", "+91 91000 20017", "Koregaon Park Heritage Home", "New"),
	("Manav Gupta", "+91 91000 20018", "Hinjewadi Worklife Apartment", "Contacted"),
	("Aditi Krishnan", "+91 91000 20019", "Adyar Banyan Grove Villa", "Qualified"),
	("Siddharth Bose", "+91 91000 20020", "OMR Marina Heights Flat", "Converted"),
]


def seed_database():
	db = SessionLocal()
	try:
		properties_by_title = {
			property_record.title: property_record
			for property_record in db.query(Property).all()
		}
		for property_data in PROPERTIES:
			if property_data["title"] not in properties_by_title:
				property_record = Property(**property_data)
				db.add(property_record)
				properties_by_title[property_record.title] = property_record

		agents_by_email = {
			agent_record.email: agent_record
			for agent_record in db.query(Agent).all()
		}
		for agent_data in AGENTS:
			if agent_data["email"] not in agents_by_email:
				agent_record = Agent(**agent_data)
				db.add(agent_record)
				agents_by_email[agent_record.email] = agent_record

		db.flush()

		current_lead_count = db.query(Lead).count()
		leads_to_add = max(0, 20 - current_lead_count)
		agent_records = list(agents_by_email.values())
		for index, (customer_name, phone, property_title, lead_status) in enumerate(
			LEADS[:leads_to_add]
		):
			db.add(
				Lead(
					customer_name=customer_name,
					phone=phone,
					property_id=properties_by_title[property_title].id,
					agent_id=agent_records[index % len(agent_records)].id,
					status=lead_status,
				)
			)

		db.commit()
		print(
			"Final counts: "
			f"properties={db.query(Property).count()}, "
			f"agents={db.query(Agent).count()}, "
			f"leads={db.query(Lead).count()}"
		)
	except Exception:
		db.rollback()
		raise
	finally:
		db.close()


if __name__ == "__main__":
	seed_database()
