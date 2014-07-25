class Marker < ActiveRecord::Base
  belongs_to :pass
  
  after_save do
    
  end
end
