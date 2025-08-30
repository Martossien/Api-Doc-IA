import sqlite3

# Connect to the database
conn = sqlite3.connect('/home/admin_ia/Api-Doc-IA/backend/data/webui.db')
cursor = conn.cursor()

# Get the list of tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

# Print the list of tables
print('Tables in the database:')
for table in tables:
    print(table[0])

# Close the connection
conn.close()