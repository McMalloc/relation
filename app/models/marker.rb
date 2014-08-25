class Marker < ActiveRecord::Base
  # attr_accessible :id, :code, :severity, :position, :pass_id no longer needed in Rails 4
  belongs_to :pass
  
end
