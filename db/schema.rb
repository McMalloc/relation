# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150110122628) do

  create_table "codes", force: true do |t|
    t.string   "tag"
    t.string   "description"
    t.string   "color"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "markers", force: true do |t|
    t.string   "code"
    t.string   "severity"
    t.integer  "position"
    t.integer  "pass_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "participants", force: true do |t|
    t.string   "name"
    t.integer  "persona_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "passes", force: true do |t|
    t.integer  "tasktime"
    t.decimal  "sum"
    t.decimal  "satisfaction"
    t.boolean  "completed"
    t.integer  "task_id"
    t.integer  "participant_id"
    t.integer  "prototype_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "recording_file_name"
    t.string   "recording_content_type"
    t.integer  "recording_file_size"
    t.datetime "recording_updated_at"
  end

  create_table "personas", force: true do |t|
    t.string   "moniker"
    t.string   "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "projects", force: true do |t|
    t.string   "name"
    t.string   "customer"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "prototypes", force: true do |t|
    t.string   "moniker"
    t.integer  "project_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "recordings", force: true do |t|
    t.integer  "length"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "tasks", force: true do |t|
    t.string   "name"
    t.string   "description"
    t.integer  "project_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
