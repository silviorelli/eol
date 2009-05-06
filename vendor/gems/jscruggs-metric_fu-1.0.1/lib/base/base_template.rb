module MetricFu

  # The Template class is intended as an abstract class for concrete
  # template classes to subclass.  It provides a variety of utility
  # methods to make templating a bit easier.  However, classes do not
  # have to inherit from here in order to provide a template.  The only
  # requirement for a template class is that it provides a #write method
  # to actually write out the template.  See StandardTemplate for an
  # example.
  class Template
    attr_accessor :report
    
    private
    # Creates a new erb evaluated result from the passed in section.
    #
    # @param section String
    #   The section name of 
    #
    # @return String
    #   The erb evaluated string
    def erbify(section)
      require 'erb'
      erb_doc = File.read(template(section))
      ERB.new(erb_doc).result(binding)
    end

    # Determines whether a template file exists for a given section
    # of the full template.
    #
    # @param section String
    #   The section of the template to check against
    #
    # @return Boolean
    #   Does a template file exist for this section or not?
    def template_exists?(section)
      File.exist?(template(section))
    end
    
    # Copies an instance variable mimicing the name of the section
    # we are trying to render, with a value equal to the passed in 
    # constant.  Allows the concrete template classes to refer to 
    # that instance variable from their ERB rendering
    #
    # @param section String
    #  The name of the instance variable to create
    #
    # @param contents Object
    #   The value to set as the value of the created instance
    #   variable
    def create_instance_var(section, contents)
      instance_variable_set("@#{section}", contents)        
    end

    # Generates the filename of the template file to load and 
    # evaluate.  In this case, the path to the template directory +
    # the section name + .html.erb
    #
    # @param section String
    #   A section of the template to render
    #
    # @return String
    #   A file path
    def template(section)
      File.join(this_directory,  section.to_s + ".html.erb")
    end

    # Returns the filename that the template will render into for
    # a given section.  In this case, the section name + '.html'
    #
    # @param section String
    #   A section of the template to render
    #
    # @return String
    #   The output filename
    def output_filename(section)
      section.to_s + ".html"
    end

    # Returns the contents of a given css file in order to 
    # render it inline into a template.
    #
    # @param css String
    #   The name of a css file to open
    #
    # @return String
    #   The contents of the css file
    def inline_css(css)
      open(File.join(this_directory, css)) { |f| f.read }      
    end
  
    # Provides a link to open a file through the textmate protocol
    # on Darwin, or otherwise, a simple file link.
    #
    # @param name String
    #   
    # @param line Integer
    #   The line number to link to, if textmate is available.  Defaults
    #   to nil
    #
    # @return String
    #   An anchor link to a textmate reference or a file reference
    def link_to_filename(name, line = nil)
      filename = File.expand_path(name)
      if MetricFu.configuration.platform.include?('darwin')
        "<a href='txmt://open/?url=file://" \
        +"#{filename}&line=#{line}'>#{name}:#{line}</a>"
      else 
       "<a href='file://#{filename}'>#{name}:#{line}</a>"
      end
    end
  

    # Provides a brain dead way to cycle between two values during
    # an iteration of some sort.  Pass in the first_value, the second_value,
    # and the cardinality of the iteration.
    #
    # @param first_value Object
    #
    # @param second_value Object
    #
    # @param iteration Integer
    #   The number of times through the iteration.
    #
    # @return Object
    #   The first_value if iteration is even.  The second_value if
    #   iteration is odd.
    def cycle(first_value, second_value, iteration)
      return first_value if iteration % 2 == 0
      return second_value
    end      
    

  end
end
